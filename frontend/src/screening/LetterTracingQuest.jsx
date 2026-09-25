import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, CheckCircle, Sparkles, ArrowRight, Volume2, PlayCircle, Star, AlertCircle, Undo2, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useProfile } from '../context/ProfileContext';
import { validateTracingAttempt } from '@ai/tracingValidation';

const ALL_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const DYSLEXIA_FOCUS_PAIRS = ['b', 'd', 'p', 'q', 'm', 'w', 's', 'z', 'n', 'u', 'i', 'j', 't', 'x'];

export const MULTILINGUAL_LETTER_SETS = {
  english: {
    all: 'abcdefghijklmnopqrstuvwxyz'.split(''),
    focus: ['b', 'd', 'p', 'q', 'm', 'w', 's', 'z', 'n', 'u', 'i', 'j', 't', 'x'],
    defaultLetter: 'b'
  },
  bengali: {
    all: ['অ', 'আ', 'ই', 'উ', 'ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ', 'ট', 'ঠ', 'ড', 'ড়', 'ত', 'থ', 'দ', 'ধ', 'ন', 'প', 'ফ', 'ব', 'ভ', 'ম', 'য', 'র', 'ল', 'শ', 'ষ', 'স', 'হ'],
    focus: ['ব', 'র', 'ক', 'ধ', 'ড', 'ড়', 'প', 'ফ', 'দ', 'ধ', 'ভ', 'ত'],
    defaultLetter: 'ব'
  },
  hindi: {
    all: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह'],
    focus: ['ब', 'भ', 'द', 'ध', 'घ', 'प', 'ष', 'क', 'फ', 'म', 'न', 'र'],
    defaultLetter: 'ब'
  }
};

// Precise Guide Paths for Letters with Multi-Stroke Support (Normalized to 280x280)
const ACCURATE_LETTER_PATHS = {
  // Bengali Letter Paths
  'ব': {
    instruction: "উপরে সোজা দাগ টানো, তারপর নিচে নামিয়ে ডানপাশে জোড়ো!",
    audioText: "ব বর্ণটি আঁকো! উপরে দাগ, তারপর নিচে নামিয়ে ডানপাশে জোড়ো!",
    guideDots: [
      { id: 1, x: 80, y: 55, label: '1' },
      { id: 2, x: 190, y: 55 },
      { id: 3, x: 190, y: 220, label: '2' },
      { id: 4, x: 135, y: 140 },
      { id: 5, x: 80, y: 220, label: '3' }
    ]
  },
  'র': {
    instruction: "'ব' বর্ণটি নিখুঁতভাবে এঁকে নিচে একটি সুন্দর গোল বিন্দু দাও!",
    audioText: "র বর্ণটি আঁকো! ব এঁকে নিচে একটি ফুটকি বা বিন্দু দাও!",
    guideDots: [
      { id: 1, x: 80, y: 55, label: '1' },
      { id: 2, x: 190, y: 55 },
      { id: 3, x: 190, y: 200, label: '2' },
      { id: 4, x: 80, y: 200, label: '3' },
      { id: 5, x: 135, y: 245, label: '•' }
    ]
  },
  'ক': {
    instruction: "উপরের মাত্রা টেনে সুন্দর বাঁকা লুপ এঁকে 'ক' পূর্ণ করো!",
    audioText: "ক বর্ণটি আঁকো!",
    guideDots: [
      { id: 1, x: 75, y: 60, label: '1' },
      { id: 2, x: 195, y: 60 },
      { id: 3, x: 195, y: 225, label: '2' },
      { id: 4, x: 120, y: 150 },
      { id: 5, x: 75, y: 225, label: '3' },
      { id: 6, x: 140, y: 180, label: '4' }
    ]
  },
  'ধ': {
    instruction: "বামপাশে ছোট বৃত্তাকার ঘুন্ডি দিয়ে শুরু করো, তারপর উপরে মাত্রা ছাড়া 'ধ' আঁকো!",
    audioText: "ধ বর্ণটি আঁকো! ছোট ঘুন্ডি দিয়ে শুরু করো!",
    guideDots: [
      { id: 1, x: 85, y: 120, label: '1' },
      { id: 2, x: 125, y: 90 },
      { id: 3, x: 95, y: 175 },
      { id: 4, x: 145, y: 225 },
      { id: 5, x: 185, y: 70, label: '2' },
      { id: 6, x: 185, y: 225, label: '3' }
    ]
  },
  'ড': {
    instruction: "উপরে সোজা মাত্রা টানো, তারপর সুন্দর বাঁক দিয়ে 'ড' আঁকো!",
    audioText: "ড বর্ণটি আঁকো!",
    guideDots: [
      { id: 1, x: 80, y: 60, label: '1' },
      { id: 2, x: 190, y: 60 },
      { id: 3, x: 140, y: 110, label: '2' },
      { id: 4, x: 95, y: 150 },
      { id: 5, x: 165, y: 185 },
      { id: 6, x: 110, y: 235, label: '3' }
    ]
  },
  'ড়': {
    instruction: "'ড' বর্ণটি এঁকে নিচে সুন্দর একটি বিন্দু দাও!",
    audioText: "ড় বর্ণটি আঁকো! নিচে বিন্দু দাও!",
    guideDots: [
      { id: 1, x: 80, y: 60, label: '1' },
      { id: 2, x: 190, y: 60 },
      { id: 3, x: 140, y: 110, label: '2' },
      { id: 4, x: 95, y: 150 },
      { id: 5, x: 165, y: 185 },
      { id: 6, x: 110, y: 215 },
      { id: 7, x: 135, y: 250, label: '•' }
    ]
  },
  'অ': {
    instruction: "ছোট গোল দিয়ে শুরু করে বাঁকাও, তারপর খাড়া রেখা ও মাত্রা দাও!",
    audioText: "অ বর্ণটি আঁকো!",
    guideDots: [
      { id: 1, x: 95, y: 110, label: '1' },
      { id: 2, x: 130, y: 90 },
      { id: 3, x: 85, y: 160 },
      { id: 4, x: 140, y: 225 },
      { id: 5, x: 185, y: 60, label: '2' },
      { id: 6, x: 185, y: 225, label: '3' }
    ]
  },
  'আ': {
    instruction: "'অ' এর পর পাশে একটি সুন্দর আকারের রেখা টানো!",
    audioText: "আ বর্ণটি আঁকো!",
    guideDots: [
      { id: 1, x: 80, y: 110, label: '1' },
      { id: 2, x: 110, y: 90 },
      { id: 3, x: 75, y: 160 },
      { id: 4, x: 120, y: 220 },
      { id: 5, x: 160, y: 60, label: '2' },
      { id: 6, x: 160, y: 220, label: '3' },
      { id: 7, x: 200, y: 60, label: '4' },
      { id: 8, x: 200, y: 220 }
    ]
  },

  // Hindi Devanagari Letter Paths
  'ब': {
    instruction: "शिरोरेखा खींचें, खड़ी रेखा बनाएं, गोल पेट बनाकर बीच में तिरछी रेखा काटें!",
    audioText: "ब अक्षर बनाएं! शिरोरेखा, खड़ी रेखा और पेट में तिरछी रेखा!",
    guideDots: [
      { id: 1, x: 70, y: 55, label: '1' },
      { id: 2, x: 200, y: 55 },
      { id: 3, x: 180, y: 55, label: '2' },
      { id: 4, x: 180, y: 225 },
      { id: 5, x: 125, y: 110, label: '3' },
      { id: 6, x: 90, y: 155 },
      { id: 7, x: 145, y: 195 },
      { id: 8, x: 180, y: 155 },
      { id: 9, x: 115, y: 130, label: '4' },
      { id: 10, x: 160, y: 175 }
    ]
  },
  'भ': {
    instruction: "ऊपर छोटी घुंडी बनाएं, नीचे आकर गाठ देकर खड़ी रेखा और छोटी शिरोरेखा दें!",
    audioText: "भ अक्षर बनाएं! आगे घुंडी और गाठ बनाएं!",
    guideDots: [
      { id: 1, x: 85, y: 95, label: '1' },
      { id: 2, x: 110, y: 75 },
      { id: 3, x: 95, y: 185, label: '2' },
      { id: 4, x: 145, y: 185 },
      { id: 5, x: 185, y: 55, label: '3' },
      { id: 6, x: 185, y: 225, label: '4' }
    ]
  },
  'द': {
    instruction: "शिरोरेखा खींचें, छोटी खड़ी रेखा, मोड़ और नीचे छोटी पूंछ निकालें!",
    audioText: "द अक्षर बनाएं! छोटी रेखा, मोड़ और नीचे पूंछ!",
    guideDots: [
      { id: 1, x: 75, y: 55, label: '1' },
      { id: 2, x: 195, y: 55 },
      { id: 3, x: 135, y: 55, label: '2' },
      { id: 4, x: 135, y: 95 },
      { id: 5, x: 90, y: 145 },
      { id: 6, x: 165, y: 185 },
      { id: 7, x: 140, y: 245, label: '3' }
    ]
  },
  'ध': {
    instruction: "छोटी घुंडी से शुरू करें, दो घुमावदार मोड़ लें और खड़ी रेखा बनाएं!",
    audioText: "ध अक्षर बनाएं! घुंडी से शुरू करें!",
    guideDots: [
      { id: 1, x: 85, y: 100, label: '1' },
      { id: 2, x: 115, y: 80 },
      { id: 3, x: 85, y: 145 },
      { id: 4, x: 135, y: 165 },
      { id: 5, x: 90, y: 215 },
      { id: 6, x: 180, y: 55, label: '2' },
      { id: 7, x: 180, y: 225, label: '3' }
    ]
  },
  'घ': {
    instruction: "पूरी शिरोरेखा खींचें, दो सुंदर मोड़ लें और खड़ी रेखा बनाएं!",
    audioText: "घ अक्षर बनाएं! पूरी शिरोरेखा और दो मोड़!",
    guideDots: [
      { id: 1, x: 75, y: 55, label: '1' },
      { id: 2, x: 195, y: 55 },
      { id: 3, x: 105, y: 95, label: '2' },
      { id: 4, x: 135, y: 140 },
      { id: 5, x: 95, y: 195 },
      { id: 6, x: 175, y: 55, label: '3' },
      { id: 7, x: 175, y: 225 }
    ]
  },
  'प': {
    instruction: "शिरोरेखा खींचें, 'U' आकार का मोड़ बनाएं और खड़ी रेखा से जोड़ें!",
    audioText: "प अक्षर बनाएं!",
    guideDots: [
      { id: 1, x: 75, y: 55, label: '1' },
      { id: 2, x: 195, y: 55 },
      { id: 3, x: 105, y: 95, label: '2' },
      { id: 4, x: 105, y: 165 },
      { id: 5, x: 175, y: 165 },
      { id: 6, x: 175, y: 55, label: '3' },
      { id: 7, x: 175, y: 225 }
    ]
  },
  'ष': {
    instruction: "'प' बनाकर उसके पेट में एक तिरछी रेखा काटें!",
    audioText: "ष अक्षर बनाएं! प बनाकर पेट में तिरछी रेखा!",
    guideDots: [
      { id: 1, x: 75, y: 55, label: '1' },
      { id: 2, x: 195, y: 55 },
      { id: 3, x: 105, y: 95, label: '2' },
      { id: 4, x: 105, y: 165 },
      { id: 5, x: 175, y: 165 },
      { id: 6, x: 175, y: 55, label: '3' },
      { id: 7, x: 175, y: 225 },
      { id: 8, x: 110, y: 110, label: '4' },
      { id: 9, x: 165, y: 165 }
    ]
  },
  'अ': {
    instruction: "दो घुमावदार मोड़ बनाएं, बीच में छोटी रेखा, खड़ी रेखा और शिरोरेखा दें!",
    audioText: "अ अक्षर बनाएं!",
    guideDots: [
      { id: 1, x: 90, y: 95, label: '1' },
      { id: 2, x: 135, y: 75 },
      { id: 3, x: 85, y: 140 },
      { id: 4, x: 145, y: 155 },
      { id: 5, x: 90, y: 215 },
      { id: 6, x: 135, y: 155, label: '2' },
      { id: 7, x: 185, y: 155 },
      { id: 8, x: 185, y: 55, label: '3' },
      { id: 9, x: 185, y: 225 }
    ]
  },
  'आ': {
    instruction: "'अ' बनाकर उसके आगे एक अतिरिक्त खड़ी आ-की-मात्रा लगाएं!",
    audioText: "आ अक्षर बनाएं!",
    guideDots: [
      { id: 1, x: 75, y: 95, label: '1' },
      { id: 2, x: 115, y: 75 },
      { id: 3, x: 75, y: 140 },
      { id: 4, x: 125, y: 155 },
      { id: 5, x: 75, y: 215 },
      { id: 6, x: 120, y: 155, label: '2' },
      { id: 7, x: 160, y: 155 },
      { id: 8, x: 160, y: 55, label: '3' },
      { id: 9, x: 160, y: 225 },
      { id: 10, x: 200, y: 55, label: '4' },
      { id: 11, x: 200, y: 225 }
    ]
  },

  // English Uppercase (Capital) Letters
  A: {
    instruction: "Trace capital 'A'! 1) Slant up to top, 2) slant down right, 3) bridge across!",
    audioText: "Trace capital letter A! Slant up, slant down, and bridge across!",
    multiStroke: true,
    requiredDots: [2, 3, 5],
    guideDots: [
      { id: 1, x: 70, y: 225, label: '1' },
      { id: 2, x: 140, y: 55, label: '2' },
      { id: 3, x: 210, y: 225, label: '3' },
      { id: 4, x: 100, y: 155, label: '4' },
      { id: 5, x: 180, y: 155, label: 'Cross' }
    ]
  },
  B: {
    instruction: "Trace capital 'B'! 1) Line down, 2) top loop to middle, 3) bottom loop to floor!",
    audioText: "Trace capital letter B! Line down, top loop, and bottom loop!",
    guideDots: [
      { id: 1, x: 80, y: 55, label: '1' },
      { id: 2, x: 80, y: 225, label: '2' },
      { id: 3, x: 145, y: 55 },
      { id: 4, x: 175, y: 95 },
      { id: 5, x: 140, y: 135, label: '3' },
      { id: 6, x: 180, y: 175 },
      { id: 7, x: 140, y: 225 },
      { id: 8, x: 80, y: 225 }
    ]
  },
  C: {
    instruction: "Trace capital 'C'! Start at top right, curve round like a giant crescent moon!",
    audioText: "Trace capital letter C! Big curve around like a moon!",
    guideDots: [
      { id: 1, x: 195, y: 75, label: '1' },
      { id: 2, x: 140, y: 55 },
      { id: 3, x: 80, y: 140 },
      { id: 4, x: 140, y: 225 },
      { id: 5, x: 195, y: 205, label: '2' }
    ]
  },
  D: {
    instruction: "Trace capital 'D'! 1) Line straight down, 2) giant round belly from top to bottom!",
    audioText: "Trace capital letter D! Line down, then giant belly on the right!",
    guideDots: [
      { id: 1, x: 80, y: 55, label: '1' },
      { id: 2, x: 80, y: 225, label: '2' },
      { id: 3, x: 140, y: 55 },
      { id: 4, x: 185, y: 140 },
      { id: 5, x: 140, y: 225 },
      { id: 6, x: 80, y: 225 }
    ]
  },
  E: {
    instruction: "Trace capital 'E'! 1) Line down, 2) top bar, 3) middle bar, 4) bottom bar!",
    audioText: "Trace capital letter E! Line down, top, middle, and bottom bar!",
    multiStroke: true,
    requiredDots: [2, 3, 4, 5],
    guideDots: [
      { id: 1, x: 80, y: 55, label: '1' },
      { id: 2, x: 80, y: 225, label: '2' },
      { id: 3, x: 180, y: 55, label: 'Top' },
      { id: 4, x: 160, y: 140, label: 'Mid' },
      { id: 5, x: 180, y: 225, label: 'Bot' }
    ]
  },
  F: {
    instruction: "Trace capital 'F'! 1) Line straight down, 2) top roof bar, 3) middle shelf bar!",
    audioText: "Trace capital letter F! Line down, top bar, and middle bar!",
    multiStroke: true,
    requiredDots: [2, 3, 4],
    guideDots: [
      { id: 1, x: 80, y: 55, label: '1' },
      { id: 2, x: 80, y: 225, label: '2' },
      { id: 3, x: 180, y: 55, label: 'Top' },
      { id: 4, x: 160, y: 140, label: 'Mid' }
    ]
  },
  G: {
    instruction: "Trace capital 'G'! Curve all the way around like C, then step inside!",
    audioText: "Trace capital letter G! Curve around, then step inside!",
    guideDots: [
      { id: 1, x: 195, y: 75, label: '1' },
      { id: 2, x: 140, y: 55 },
      { id: 3, x: 80, y: 140 },
      { id: 4, x: 140, y: 225 },
      { id: 5, x: 195, y: 160, label: '2' },
      { id: 6, x: 155, y: 160 }
    ]
  },
  H: {
    instruction: "Trace capital 'H'! 1) Left line down, 2) right line down, 3) connect the bridge!",
    audioText: "Trace capital letter H! Two lines down, then connect the middle bridge!",
    multiStroke: true,
    requiredDots: [2, 4, 5],
    guideDots: [
      { id: 1, x: 80, y: 55, label: '1' },
      { id: 2, x: 80, y: 225, label: '2' },
      { id: 3, x: 200, y: 55, label: '3' },
      { id: 4, x: 200, y: 225, label: '4' },
      { id: 5, x: 140, y: 140, label: 'Bridge' }
    ]
  },
  I: {
    instruction: "Trace capital 'I'! Line straight down the center with top and bottom hats!",
    audioText: "Trace capital letter I! Line straight down with top and bottom hats!",
    guideDots: [
      { id: 1, x: 90, y: 55, label: '1' },
      { id: 2, x: 190, y: 55 },
      { id: 3, x: 140, y: 55, label: '2' },
      { id: 4, x: 140, y: 225, label: '3' },
      { id: 5, x: 90, y: 225, label: '4' },
      { id: 6, x: 190, y: 225 }
    ]
  },
  J: {
    instruction: "Trace capital 'J'! Top roof bar, then line down that curves up like a hook!",
    audioText: "Trace capital letter J! Roof bar, then curve up like a hook!",
    guideDots: [
      { id: 1, x: 90, y: 55, label: '1' },
      { id: 2, x: 200, y: 55 },
      { id: 3, x: 165, y: 55, label: '2' },
      { id: 4, x: 165, y: 180 },
      { id: 5, x: 110, y: 225, label: '3' },
      { id: 6, x: 75, y: 175 }
    ]
  },
  K: {
    instruction: "Trace capital 'K'! 1) Tall line down, 2) slant into the middle, 3) kick out!",
    audioText: "Trace capital letter K! Line down, slant in, slant kick out!",
    multiStroke: true,
    requiredDots: [2, 3, 4],
    guideDots: [
      { id: 1, x: 80, y: 55, label: '1' },
      { id: 2, x: 80, y: 225, label: '2' },
      { id: 3, x: 190, y: 55, label: '3' },
      { id: 4, x: 95, y: 140 },
      { id: 5, x: 190, y: 225, label: '4' }
    ]
  },
  L: {
    instruction: "Trace capital 'L'! Go straight down, then take a sharp right turn on the floor!",
    audioText: "Trace capital letter L! Straight down, then turn right!",
    guideDots: [
      { id: 1, x: 85, y: 55, label: '1' },
      { id: 2, x: 85, y: 225, label: '2' },
      { id: 3, x: 195, y: 225, label: '3' }
    ]
  },
  M: {
    instruction: "Trace capital 'M'! 1) Up, 2) slide down to middle, 3) climb up, 4) straight down!",
    audioText: "Trace capital letter M! Up, slide down, climb up, straight down!",
    guideDots: [
      { id: 1, x: 70, y: 225, label: '1' },
      { id: 2, x: 70, y: 55, label: '2' },
      { id: 3, x: 140, y: 155, label: '3' },
      { id: 4, x: 210, y: 55, label: '4' },
      { id: 5, x: 210, y: 225, label: '5' }
    ]
  },
  N: {
    instruction: "Trace capital 'N'! 1) Straight up, 2) slide down to bottom right, 3) straight up!",
    audioText: "Trace capital letter N! Straight up, slide down, and straight up!",
    guideDots: [
      { id: 1, x: 75, y: 225, label: '1' },
      { id: 2, x: 75, y: 55, label: '2' },
      { id: 3, x: 205, y: 225, label: '3' },
      { id: 4, x: 205, y: 55, label: '4' }
    ]
  },
  O: {
    instruction: "Trace capital 'O'! Start at the top and loop all the way round like a giant bubble!",
    audioText: "Trace capital letter O! Giant round circle from the top!",
    svgPath: "M 140 55 C 50 55 50 225 140 225 C 230 225 230 55 140 55 Z",
    guideDots: [
      { id: 1, x: 140, y: 55, label: '1' },
      { id: 2, x: 75, y: 140 },
      { id: 3, x: 140, y: 225, label: '2' },
      { id: 4, x: 205, y: 140 },
      { id: 5, x: 140, y: 55 }
    ]
  },
  P: {
    instruction: "Trace capital 'P'! 1) Tall line down, 2) round balloon loop at the top right!",
    audioText: "Trace capital letter P! Line down, then loop at the top right!",
    guideDots: [
      { id: 1, x: 80, y: 55, label: '1' },
      { id: 2, x: 80, y: 225, label: '2' },
      { id: 3, x: 145, y: 55 },
      { id: 4, x: 185, y: 95 },
      { id: 5, x: 145, y: 140 },
      { id: 6, x: 80, y: 140 }
    ]
  },
  Q: {
    instruction: "Trace capital 'Q'! Draw a giant 'O', then add a little walking stick tail at bottom!",
    audioText: "Trace capital letter Q! Giant circle with a little kick tail!",
    multiStroke: true,
    requiredDots: [3, 5],
    guideDots: [
      { id: 1, x: 140, y: 55, label: '1' },
      { id: 2, x: 75, y: 140 },
      { id: 3, x: 140, y: 225 },
      { id: 4, x: 205, y: 140 },
      { id: 5, x: 155, y: 185, label: 'Tail' },
      { id: 6, x: 215, y: 235 }
    ]
  },
  R: {
    instruction: "Trace capital 'R'! 1) Line down, 2) top balloon loop, 3) slant kick leg down!",
    audioText: "Trace capital letter R! Line down, top loop, and kick leg down!",
    guideDots: [
      { id: 1, x: 80, y: 55, label: '1' },
      { id: 2, x: 80, y: 225, label: '2' },
      { id: 3, x: 145, y: 55 },
      { id: 4, x: 180, y: 95 },
      { id: 5, x: 135, y: 135 },
      { id: 6, x: 80, y: 135 },
      { id: 7, x: 185, y: 225, label: '3' }
    ]
  },
  S: {
    instruction: "Trace capital 'S'! Curve left like a snake, turn right, and curve left again!",
    audioText: "Trace capital letter S! Curve left, turn right, and curve left!",
    guideDots: [
      { id: 1, x: 185, y: 80, label: '1' },
      { id: 2, x: 140, y: 55 },
      { id: 3, x: 85, y: 95 },
      { id: 4, x: 140, y: 140 },
      { id: 5, x: 195, y: 185 },
      { id: 6, x: 140, y: 225 },
      { id: 7, x: 85, y: 200, label: '2' }
    ]
  },
  T: {
    instruction: "Trace capital 'T'! 1) Top roof bar all the way across, 2) line straight down the middle!",
    audioText: "Trace capital letter T! Roof bar, then straight line down!",
    multiStroke: true,
    requiredDots: [2, 4],
    guideDots: [
      { id: 1, x: 70, y: 55, label: '1' },
      { id: 2, x: 210, y: 55, label: 'Roof' },
      { id: 3, x: 140, y: 55, label: '2' },
      { id: 4, x: 140, y: 225, label: 'Stem' }
    ]
  },
  U: {
    instruction: "Trace capital 'U'! Start at top, go down, round the bottom, and climb back up!",
    audioText: "Trace capital letter U! Down, curve the bottom, and climb back up!",
    guideDots: [
      { id: 1, x: 85, y: 55, label: '1' },
      { id: 2, x: 85, y: 165 },
      { id: 3, x: 140, y: 225 },
      { id: 4, x: 195, y: 165 },
      { id: 5, x: 195, y: 55, label: '2' }
    ]
  },
  V: {
    instruction: "Trace capital 'V'! Slant down to a sharp point, then slant right back up!",
    audioText: "Trace capital letter V! Slant down to a point, then slant up!",
    guideDots: [
      { id: 1, x: 75, y: 55, label: '1' },
      { id: 2, x: 140, y: 225, label: 'Point' },
      { id: 3, x: 205, y: 55, label: '2' }
    ]
  },
  W: {
    instruction: "Trace capital 'W'! Slant down, up, down, and up to make two giant V's!",
    audioText: "Trace capital letter W! Down, up, down, and up!",
    guideDots: [
      { id: 1, x: 65, y: 55, label: '1' },
      { id: 2, x: 105, y: 225, label: '2' },
      { id: 3, x: 140, y: 120, label: '3' },
      { id: 4, x: 175, y: 225, label: '4' },
      { id: 5, x: 215, y: 55, label: '5' }
    ]
  },
  X: {
    instruction: "Trace capital 'X'! 1) Slant from top-left to bottom-right, 2) cross the other way!",
    audioText: "Trace capital letter X! Slant down, then cross the other way!",
    multiStroke: true,
    requiredDots: [2, 4],
    guideDots: [
      { id: 1, x: 75, y: 55, label: '1' },
      { id: 2, x: 205, y: 225, label: '2' },
      { id: 3, x: 205, y: 55, label: '3' },
      { id: 4, x: 75, y: 225, label: 'Cross' }
    ]
  },
  Y: {
    instruction: "Trace capital 'Y'! Slant down to middle from left, from right, then stem straight down!",
    audioText: "Trace capital letter Y! Little V at top, then straight stem down!",
    multiStroke: true,
    requiredDots: [2, 4],
    guideDots: [
      { id: 1, x: 75, y: 55, label: '1' },
      { id: 2, x: 140, y: 135, label: '2' },
      { id: 3, x: 205, y: 55, label: '3' },
      { id: 4, x: 140, y: 225, label: 'Stem' }
    ]
  },
  Z: {
    instruction: "Trace capital 'Z'! Across the top, diagonal slide down left, across the bottom!",
    audioText: "Trace capital letter Z! Across, slide down left, across the bottom!",
    guideDots: [
      { id: 1, x: 75, y: 55, label: '1' },
      { id: 2, x: 205, y: 55, label: '2' },
      { id: 3, x: 75, y: 225, label: '3' },
      { id: 4, x: 205, y: 225, label: '4' }
    ]
  },

  // English Lowercase Letters

  a: {
    instruction: "Trace 'a'! Circle around to the left, then draw straight down!",
    audioText: "Trace letter a! Circle to the left, then line down!",
    guideDots: [
      { id: 1, x: 180, y: 120, label: '1' },
      { id: 2, x: 120, y: 130 },
      { id: 3, x: 95, y: 175 },
      { id: 4, x: 130, y: 220 },
      { id: 5, x: 180, y: 190, label: '2' },
      { id: 6, x: 180, y: 225, label: '3' }
    ]
  },
  b: {
    instruction: "Trace 'b'! Start tall at the top, go straight down, then loop the belly on the right!",
    audioText: "Trace letter b! Tall line down, then round belly on the right!",
    bellyOrientation: 'right',
    guideDots: [
      { id: 1, x: 90, y: 45, label: '1' },
      { id: 2, x: 90, y: 135 },
      { id: 3, x: 90, y: 225, label: '2' },
      { id: 4, x: 135, y: 135 },
      { id: 5, x: 175, y: 180 },
      { id: 6, x: 135, y: 225 },
      { id: 7, x: 90, y: 225 }
    ]
  },
  c: {
    instruction: "Trace 'c'! Start at the top right, curve up and all the way around like a moon!",
    audioText: "Trace letter c! Curve around like a moon!",
    guideDots: [
      { id: 1, x: 180, y: 130, label: '1' },
      { id: 2, x: 130, y: 115 },
      { id: 3, x: 90, y: 175 },
      { id: 4, x: 130, y: 230 },
      { id: 5, x: 180, y: 215, label: '2' }
    ]
  },
  d: {
    instruction: "Trace 'd'! Make the round belly on the left first, then go to the top and draw down!",
    audioText: "Trace letter d! Round belly on the left, then tall line down!",
    bellyOrientation: 'left',
    guideDots: [
      { id: 1, x: 155, y: 135, label: '1' },
      { id: 2, x: 110, y: 140 },
      { id: 3, x: 85, y: 180 },
      { id: 4, x: 120, y: 225 },
      { id: 5, x: 175, y: 225, label: '2' },
      { id: 6, x: 175, y: 45, label: '3' },
      { id: 7, x: 175, y: 135 }
    ]
  },
  e: {
    instruction: "Trace 'e'! Go across the middle, curve over the top, and around!",
    audioText: "Trace letter e! Across the middle, over and around!",
    guideDots: [
      { id: 1, x: 100, y: 175, label: '1' },
      { id: 2, x: 175, y: 175 },
      { id: 3, x: 140, y: 120, label: '2' },
      { id: 4, x: 90, y: 170 },
      { id: 5, x: 140, y: 225 },
      { id: 6, x: 175, y: 210, label: '3' }
    ]
  },
  f: {
    instruction: "Trace 'f'! Curve over like a candy cane, draw down, then lift and cross the middle!",
    audioText: "Trace letter f! Candy cane top, then cross the middle!",
    multiStroke: true,
    requiredDots: [4, 6], // Candy cane bottom & Crossbar
    guideDots: [
      { id: 1, x: 170, y: 60, label: '1' },
      { id: 2, x: 130, y: 45 },
      { id: 3, x: 120, y: 135 },
      { id: 4, x: 120, y: 235, label: '2' },
      { id: 5, x: 90, y: 135, label: 'Cross ➔' },
      { id: 6, x: 155, y: 135 }
    ]
  },
  g: {
    instruction: "Trace 'g'! Make the circle on top, then draw down with a hook tail below!",
    audioText: "Trace letter g! Circle on top and hook tail below!",
    guideDots: [
      { id: 1, x: 165, y: 125, label: '1' },
      { id: 2, x: 105, y: 135 },
      { id: 3, x: 105, y: 190 },
      { id: 4, x: 165, y: 190, label: '2' },
      { id: 5, x: 165, y: 245 },
      { id: 6, x: 110, y: 255, label: '3' }
    ]
  },
  h: {
    instruction: "Trace 'h'! Start tall, draw straight down, then arch over to the right!",
    audioText: "Trace letter h! Tall line down and arch over!",
    guideDots: [
      { id: 1, x: 85, y: 45, label: '1' },
      { id: 2, x: 85, y: 140 },
      { id: 3, x: 85, y: 230, label: '2' },
      { id: 4, x: 135, y: 135 },
      { id: 5, x: 175, y: 175 },
      { id: 6, x: 175, y: 230, label: '3' }
    ]
  },
  i: {
    instruction: "Trace 'i'! 1) Draw the line down, then 2) tap the dot on top!",
    audioText: "Trace letter i! Draw the line down, then tap the dot on top!",
    multiStroke: true,
    dotId: 4,
    stemDotIds: [1, 2, 3],
    guideDots: [
      { id: 1, x: 140, y: 125, label: '1' },
      { id: 2, x: 140, y: 175 },
      { id: 3, x: 140, y: 225, label: '2' },
      { id: 4, x: 140, y: 70, label: 'Dot 👆' }
    ]
  },
  j: {
    instruction: "Trace 'j'! 1) Draw down with a hook tail below, then 2) tap the dot on top!",
    audioText: "Trace letter j! Draw the hook tail down, then tap the dot on top!",
    multiStroke: true,
    dotId: 5,
    stemDotIds: [1, 2, 3, 4],
    guideDots: [
      { id: 1, x: 155, y: 125, label: '1' },
      { id: 2, x: 155, y: 185 },
      { id: 3, x: 155, y: 240, label: '2' },
      { id: 4, x: 105, y: 255, label: '3' },
      { id: 5, x: 155, y: 70, label: 'Dot 👆' }
    ]
  },
  k: {
    instruction: "Trace 'k'! 1) Tall line down, 2) slant in, and 3) kick out!",
    audioText: "Trace letter k! Tall line down, slant in, and kick out!",
    multiStroke: true,
    guideDots: [
      { id: 1, x: 90, y: 45, label: '1' },
      { id: 2, x: 90, y: 230, label: '2' },
      { id: 3, x: 175, y: 120, label: 'In 3' },
      { id: 4, x: 90, y: 175 },
      { id: 5, x: 175, y: 230, label: 'Out 4' }
    ]
  },
  l: {
    instruction: "Trace 'l'! Start at the very top and draw one tall, straight line down!",
    audioText: "Trace letter l! One tall line straight down!",
    guideDots: [
      { id: 1, x: 140, y: 45, label: '1' },
      { id: 2, x: 140, y: 140 },
      { id: 3, x: 140, y: 230, label: '2' }
    ]
  },
  m: {
    instruction: "Trace 'm'! Draw down, then make two rainbow arches to the right!",
    audioText: "Trace letter m! Draw down, then two arches!",
    guideDots: [
      { id: 1, x: 60, y: 120, label: '1' },
      { id: 2, x: 60, y: 230, label: '2' },
      { id: 3, x: 115, y: 120, label: '3' },
      { id: 4, x: 115, y: 230 },
      { id: 5, x: 175, y: 120, label: '4' },
      { id: 6, x: 175, y: 230 }
    ]
  },
  n: {
    instruction: "Trace 'n'! Draw straight down, then arch over to the right!",
    audioText: "Trace letter n! Straight down, then arch over!",
    guideDots: [
      { id: 1, x: 80, y: 120, label: '1' },
      { id: 2, x: 80, y: 230, label: '2' },
      { id: 3, x: 135, y: 120, label: '3' },
      { id: 4, x: 175, y: 170 },
      { id: 5, x: 175, y: 230, label: '4' }
    ]
  },
  o: {
    instruction: "Trace 'o'! Start at the top, curve around all the way like a big donut!",
    audioText: "Trace letter o! Round and round like a donut!",
    svgPath: "M 140 115 C 65 115 65 235 140 235 C 215 235 215 115 140 115 Z",
    guideDots: [
      { id: 1, x: 140, y: 115, label: '1' },
      { id: 2, x: 85, y: 175 },
      { id: 3, x: 140, y: 235, label: '2' },
      { id: 4, x: 195, y: 175 },
      { id: 5, x: 140, y: 115, label: '3' }
    ]
  },
  p: {
    instruction: "Trace 'p'! Start at the top, go down below the line, then loop on the right!",
    audioText: "Trace letter p! Straight down below, then loop on the top right!",
    bellyOrientation: 'right',
    guideDots: [
      { id: 1, x: 90, y: 110, label: '1' },
      { id: 2, x: 90, y: 180 },
      { id: 3, x: 90, y: 255, label: '2' },
      { id: 4, x: 135, y: 110 },
      { id: 5, x: 175, y: 145 },
      { id: 6, x: 135, y: 185 },
      { id: 7, x: 90, y: 185 }
    ]
  },
  q: {
    instruction: "Trace 'q'! Make the round loop on the left first, then go down below with a flick!",
    audioText: "Trace letter q! Circle on the left, then straight down below!",
    bellyOrientation: 'left',
    guideDots: [
      { id: 1, x: 155, y: 120, label: '1' },
      { id: 2, x: 105, y: 125 },
      { id: 3, x: 85, y: 155 },
      { id: 4, x: 120, y: 185 },
      { id: 5, x: 175, y: 185, label: '2' },
      { id: 6, x: 175, y: 255, label: '3' }
    ]
  },
  r: {
    instruction: "Trace 'r'! Draw down, go back up, and hook over to the right!",
    audioText: "Trace letter r! Draw down, back up, and hook over!",
    guideDots: [
      { id: 1, x: 90, y: 120, label: '1' },
      { id: 2, x: 90, y: 230, label: '2' },
      { id: 3, x: 135, y: 120, label: '3' },
      { id: 4, x: 175, y: 140 }
    ]
  },
  s: {
    instruction: "Trace 's'! Slither like a friendly snake! Curve left, switch across, and curve right!",
    audioText: "Trace letter s! Slither like a snake, curve left and curve right!",
    guideDots: [
      { id: 1, x: 170, y: 130, label: '1' },
      { id: 2, x: 130, y: 115 },
      { id: 3, x: 95, y: 150 },
      { id: 4, x: 140, y: 175, label: '2' },
      { id: 5, x: 175, y: 205 },
      { id: 6, x: 130, y: 235 },
      { id: 7, x: 90, y: 220, label: '3' }
    ]
  },
  t: {
    instruction: "Trace 't'! 1) Tall line down with a curl, then 2) lift and draw the crossbar across!",
    audioText: "Trace letter t! Tall line down, then cross the bar across!",
    multiStroke: true,
    requiredDots: [3, 5],
    guideDots: [
      { id: 1, x: 140, y: 55, label: '1' },
      { id: 2, x: 140, y: 160 },
      { id: 3, x: 140, y: 230, label: '2' },
      { id: 4, x: 95, y: 120, label: 'Cross ➔' },
      { id: 5, x: 185, y: 120 }
    ]
  },
  u: {
    instruction: "Trace 'u'! Go down, curve up like a smile, and draw straight down!",
    audioText: "Trace letter u! Down, smile up, and straight down!",
    guideDots: [
      { id: 1, x: 90, y: 120, label: '1' },
      { id: 2, x: 90, y: 200 },
      { id: 3, x: 140, y: 235, label: '2' },
      { id: 4, x: 180, y: 200 },
      { id: 5, x: 180, y: 120, label: '3' },
      { id: 6, x: 180, y: 230 }
    ]
  },
  v: {
    instruction: "Trace 'v'! Slant down to the point, then slant up to the top!",
    audioText: "Trace letter v! Slant down, slant up!",
    guideDots: [
      { id: 1, x: 80, y: 120, label: '1' },
      { id: 2, x: 140, y: 230, label: '2' },
      { id: 3, x: 200, y: 120, label: '3' }
    ]
  },
  w: {
    instruction: "Trace 'w'! Slant down, slant up, slant down, and slant up again!",
    audioText: "Trace letter w! Down, up, down, up like two valleys!",
    guideDots: [
      { id: 1, x: 60, y: 120, label: '1' },
      { id: 2, x: 95, y: 230 },
      { id: 3, x: 130, y: 145, label: '2' },
      { id: 4, x: 165, y: 230 },
      { id: 5, x: 200, y: 120, label: '3' }
    ]
  },
  x: {
    instruction: "Trace 'x'! 1) Slant down right, then 2) lift and slant down left across!",
    audioText: "Trace letter x! Slant down right, then cross down left!",
    multiStroke: true,
    requiredDots: [2, 4],
    guideDots: [
      { id: 1, x: 90, y: 120, label: '1' },
      { id: 2, x: 190, y: 225, label: '2' },
      { id: 3, x: 190, y: 120, label: 'Cross ➔' },
      { id: 4, x: 90, y: 225, label: '4' }
    ]
  },
  y: {
    instruction: "Trace 'y'! 1) Slant short to the middle, then 2) slant long down below!",
    audioText: "Trace letter y! Short slant, then long slant down below!",
    multiStroke: true,
    requiredDots: [2, 4],
    guideDots: [
      { id: 1, x: 85, y: 120, label: '1' },
      { id: 2, x: 140, y: 175, label: '2' },
      { id: 3, x: 195, y: 120, label: '3' },
      { id: 4, x: 105, y: 260, label: '4' }
    ]
  },
  z: {
    instruction: "Trace 'z'! Go across to the right, slant down left, and across the bottom!",
    audioText: "Trace letter z! Across, slant down, and across!",
    guideDots: [
      { id: 1, x: 85, y: 120, label: '1' },
      { id: 2, x: 185, y: 120, label: '2' },
      { id: 3, x: 85, y: 225, label: '3' },
      { id: 4, x: 185, y: 225, label: '4' }
    ]
  }
};

const generateSvgPathFromDots = (dots) => {
  if (!dots || dots.length === 0) return '';
  let path = `M ${dots[0].x} ${dots[0].y}`;
  for (let i = 1; i < dots.length; i++) {
    path += ` L ${dots[i].x} ${dots[i].y}`;
  }
  return path;
};

const getLetterConfig = (char) => {
  if (ACCURATE_LETTER_PATHS[char]) {
    return { char, ...ACCURATE_LETTER_PATHS[char] };
  }
  return {
    char,
    instruction: `Trace the letter '${char}'! Follow the golden guide dots!`,
    audioText: `Trace letter ${char}!`,
    guideDots: [
      { id: 1, x: 90, y: 90, label: '1' },
      { id: 2, x: 140, y: 160, label: '2' },
      { id: 3, x: 190, y: 230, label: '3' }
    ]
  };
};

export default function LetterTracingQuest({ onCompleteQuest, onBack, adaptiveConfig }) {
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();
  const { addStars, recordActivityCompletion, activeProfile, activeLanguage } = useProfile();

  const langId = activeLanguage?.id || 'english';
  const isBengali = langId === 'bengali';
  const isHindi = langId === 'hindi';
  const speechLang = isHindi ? 'hi-IN' : (isBengali ? 'bn-IN' : 'en-US');
  const langLetterSet = MULTILINGUAL_LETTER_SETS[langId] || MULTILINGUAL_LETTER_SETS.english;

  const canvasRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const initialLetter = adaptiveConfig?.initialLetter || langLetterSet.defaultLetter || 'b';
  const [selectedLetter, setSelectedLetter] = useState(initialLetter);
  const [letterCase, setLetterCase] = useState('lower'); // 'lower' | 'upper' (English)
  const [viewFilter, setViewFilter] = useState(adaptiveConfig?.focusArea === 'tracing' ? 'focus' : 'all');
  const [isDrawing, setIsDrawing] = useState(false);
  const [collectedDotIds, setCollectedDotIds] = useState(new Set());
  const [tracingStatus, setTracingStatus] = useState('idle'); // 'idle' | 'in_progress' | 'need_dot' | 'need_cross' | 'success'
  const [isDemonstrating, setIsDemonstrating] = useState(false);
  const [drawnStrokes, setDrawnStrokes] = useState([]);
  const currentStrokeRef = useRef([]);
  const visitedDotSequenceRef = useRef([]);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const [feedbackError, setFeedbackError] = useState(null);

  // Sync letter when language changes
  useEffect(() => {
    const validLetters = langLetterSet.all.concat(langLetterSet.focus);
    const validUpper = validLetters.map(l => l.toUpperCase());
    if (!validLetters.includes(selectedLetter) && !validUpper.includes(selectedLetter)) {
      setSelectedLetter(langLetterSet.defaultLetter);
    }
  }, [langId]);

  const currentTarget = getLetterConfig(selectedLetter);

  useEffect(() => {
    speakText(currentTarget.audioText, speechLang);
    resetCanvas();
  }, [selectedLetter, langId]);

  // Particle animation loop
  useEffect(() => {
    const pCanvas = particleCanvasRef.current;
    if (!pCanvas) return;
    const pCtx = pCanvas.getContext('2d');

    const renderParticles = () => {
      pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
      const remaining = [];

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        p.size = Math.max(0, p.size * 0.94);

        if (p.life > 0 && p.size > 0.3) {
          remaining.push(p);
          pCtx.save();
          pCtx.globalAlpha = Math.min(1, p.life / p.maxLife);
          pCtx.fillStyle = p.color;
          pCtx.shadowColor = p.color;
          pCtx.shadowBlur = 6;

          if (p.shape === 'star') {
            pCtx.beginPath();
            pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            pCtx.fill();
            // Star cross burst
            pCtx.fillRect(p.x - p.size * 1.5, p.y - 1, p.size * 3, 2);
            pCtx.fillRect(p.x - 1, p.y - p.size * 1.5, 2, p.size * 3);
          } else {
            pCtx.beginPath();
            pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            pCtx.fill();
          }
          pCtx.restore();
        }
      }

      particlesRef.current = remaining;
      animFrameRef.current = requestAnimationFrame(renderParticles);
    };

    animFrameRef.current = requestAnimationFrame(renderParticles);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const spawnParticles = (x, y, count = 4, isBurst = false) => {
    const colors = ['#F59E0B', '#FBBF24', '#FDE68A', '#4F46E5', '#818CF8', '#10B981'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = isBurst ? 2 + Math.random() * 4 : 0.8 + Math.random() * 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: isBurst ? 4 + Math.random() * 5 : 3 + Math.random() * 4,
        life: isBurst ? 30 + Math.random() * 20 : 18 + Math.random() * 12,
        maxLife: isBurst ? 50 : 30,
        shape: Math.random() > 0.4 ? 'star' : 'circle'
      });
    }
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const setStrokeStyle = (ctx) => {
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#4F46E5';
    ctx.shadowColor = '#818CF8';
    ctx.shadowBlur = 10;
  };

  const redrawCanvas = (strokesToDraw) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokesToDraw.forEach((stroke) => {
      if (!stroke || stroke.length === 0) return;
      ctx.beginPath();
      setStrokeStyle(ctx);

      if (stroke.length === 1) {
        ctx.arc(stroke[0].x, stroke[0].y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#4F46E5';
        ctx.fill();
      } else {
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
          const prev = stroke[i - 1];
          const curr = stroke[i];
          const midX = (prev.x + curr.x) / 2;
          const midY = (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
        }
        ctx.lineTo(stroke[stroke.length - 1].x, stroke[stroke.length - 1].y);
        ctx.stroke();
      }
    });
  };

  const startDrawing = (e) => {
    e.preventDefault();
    if (isDemonstrating || tracingStatus === 'success') return;
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setFeedbackError(null);

    currentStrokeRef.current = [coords];
    checkDotCollisions(coords);
    spawnParticles(coords.x, coords.y, 4);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    setStrokeStyle(ctx);

    ctx.beginPath();
    ctx.arc(coords.x, coords.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#4F46E5';
    ctx.fill();
  };

  const draw = (e) => {
    if (!isDrawing || isDemonstrating || tracingStatus === 'success') return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    currentStrokeRef.current.push(coords);
    checkDotCollisions(coords);
    spawnParticles(coords.x, coords.y, 2);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    setStrokeStyle(ctx);

    const pts = currentStrokeRef.current;
    const prev = pts[Math.max(0, pts.length - 2)];
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  // Magnetic touch hit radius (22px)
  const checkDotCollisions = (coords) => {
    currentTarget.guideDots.forEach((dot) => {
      const dist = Math.hypot(coords.x - dot.x, coords.y - dot.y);
      if (dist < 22 && !collectedDotIds.has(dot.id)) {
        visitedDotSequenceRef.current.push(dot.id);
        setCollectedDotIds((prev) => {
          const next = new Set(prev);
          next.add(dot.id);
          return next;
        });
        spawnParticles(dot.x, dot.y, 12, true);
        playPop();
      }
    });
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStrokeRef.current.length > 0) {
      const newStrokes = [...drawnStrokes, currentStrokeRef.current];
      setDrawnStrokes(newStrokes);
      redrawCanvas(newStrokes);

      // Perform validation
      const validation = validateTracingAttempt({
        drawnStrokes: newStrokes,
        guideDots: currentTarget.guideDots,
        collectedDotIds: collectedDotIds,
        visitedDotSequence: visitedDotSequenceRef.current,
        targetConfig: currentTarget
      });

      if (validation.isValid) {
        setFeedbackError(null);
        triggerSuccess();
      } else if (validation.isInProgress) {
        setFeedbackError(null);
        setTracingStatus(validation.reason || 'in_progress');
      } else {
        if (validation.reason !== 'no_strokes' && validation.reason !== 'too_short') {
          const langKey = isHindi ? 'hi' : (isBengali ? 'bn' : 'en');
          const errMsg = validation.feedback[langKey] || validation.feedback.en;
          setFeedbackError(errMsg);
          speakText(errMsg, speechLang);
          playPop();
        }
      }
    }
  };

  const handleUndo = () => {
    if (drawnStrokes.length === 0 || isDemonstrating || tracingStatus === 'success') return;
    playPop();
    const remainingStrokes = drawnStrokes.slice(0, -1);
    setDrawnStrokes(remainingStrokes);
    redrawCanvas(remainingStrokes);

    // Recompute collected dots from remaining strokes
    const newCollected = new Set();
    const newVisited = [];
    const allPts = remainingStrokes.flat();

    currentTarget.guideDots.forEach((dot) => {
      const touched = allPts.some(pt => Math.hypot(pt.x - dot.x, pt.y - dot.y) < 22);
      if (touched) {
        newCollected.add(dot.id);
        newVisited.push(dot.id);
      }
    });

    setCollectedDotIds(newCollected);
    visitedDotSequenceRef.current = newVisited;
    setTracingStatus('idle');
    setFeedbackError(null);
  };

  const triggerSuccess = () => {
    if (tracingStatus === 'success') return;
    setTracingStatus('success');
    playStarTwinkle();
    if (recordActivityCompletion) {
      recordActivityCompletion({
        activityId: 'letter-tracing',
        starsEarned: 5,
        metricUpdates: {
          tracingAccuracy: Math.min(98, (activeProfile?.screeningMetrics?.tracingAccuracy || 70) + 5)
        }
      });
    } else {
      addStars(5);
    }

    try {
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.6 }
      });
    } catch (err) {}
  };

  // Show Me Auto Demonstration Animation
  const handleDemonstration = () => {
    if (isDemonstrating) return;
    resetCanvas();
    setIsDemonstrating(true);
    speakText(`Watch Mitra draw letter ${selectedLetter}!`);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dots = currentTarget.guideDots;
    let index = 0;

    const interval = setInterval(() => {
      if (index < dots.length) {
        const dot = dots[index];
        setStrokeStyle(ctx, index * 5);
        spawnParticles(dot.x, dot.y, 8, true);

        if (index === 0 || (currentTarget.multiStroke && (dot.label?.includes('Cross') || dot.label?.includes('Dot') || dot.label?.includes('In')))) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#F59E0B';
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(dot.x, dot.y);
        } else {
          ctx.lineTo(dot.x, dot.y);
          ctx.stroke();
        }
        playChime(450 + index * 35);
        index++;
      } else {
        clearInterval(interval);
        setIsDemonstrating(false);
        speakText('Your turn now! Give it a try!');
      }
    }, 380);
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    const pCanvas = particleCanvasRef.current;
    if (pCanvas) {
      const pCtx = pCanvas.getContext('2d');
      pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    }
    particlesRef.current = [];
    setCollectedDotIds(new Set());
    setDrawnStrokes([]);
    currentStrokeRef.current = [];
    visitedDotSequenceRef.current = [];
    setTracingStatus('idle');
    setFeedbackError(null);
  };

  const rawList = viewFilter === 'focus' ? langLetterSet.focus : langLetterSet.all;
  const letterList = (langId === 'english' && letterCase === 'upper')
    ? rawList.map(ch => ch.toUpperCase())
    : rawList;

  const totalGuideDots = currentTarget.guideDots.length;
  const collectedCount = collectedDotIds.size;

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        maxWidth: '620px',
        margin: '0 auto',
        width: '100%',
        textAlign: 'center',
        borderRadius: '28px'
      }}
    >
      {onBack && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
          <button
            onClick={() => {
              playPop();
              onBack();
            }}
            className="btn btn-secondary btn-pill"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
          >
            ← {isHindi ? 'खेलों पर वापस' : (isBengali ? 'খেলায় ফিরে যান' : 'Back to Games')}
          </button>
        </div>
      )}

      {/* Alphabet Selector */}
      <div style={{ marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🪄</span>
            <span style={{ fontWeight: '700', fontSize: '1.05rem', color: '#1E293B' }}>
              {isHindi ? 'अक्षर चुनें और ट्रेस करें' : (isBengali ? 'বর্ণ বেছে নাও এবং আঁকো' : 'Magic Wand Letter Tracing')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {/* Case Switcher for English: [ a-z Small ] | [ A-Z Capital ] */}
            {langId === 'english' && (
              <div style={{ display: 'flex', gap: '0.25rem', background: '#FEF3C7', padding: '0.2rem', borderRadius: '9999px', border: '1px solid #FDE68A' }}>
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setLetterCase('lower');
                    if (selectedLetter && selectedLetter === selectedLetter.toUpperCase()) {
                      setSelectedLetter(selectedLetter.toLowerCase());
                    }
                  }}
                  style={{
                    border: 'none',
                    background: letterCase === 'lower' ? '#F59E0B' : 'transparent',
                    color: letterCase === 'lower' ? 'white' : '#92400E',
                    fontWeight: '800',
                    fontSize: '0.74rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    boxShadow: letterCase === 'lower' ? '0 1px 4px rgba(245, 158, 11, 0.3)' : 'none'
                  }}
                >
                  a-z Small
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setLetterCase('upper');
                    if (selectedLetter && selectedLetter === selectedLetter.toLowerCase()) {
                      setSelectedLetter(selectedLetter.toUpperCase());
                    }
                  }}
                  style={{
                    border: 'none',
                    background: letterCase === 'upper' ? '#F59E0B' : 'transparent',
                    color: letterCase === 'upper' ? 'white' : '#92400E',
                    fontWeight: '800',
                    fontSize: '0.74rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    boxShadow: letterCase === 'upper' ? '0 1px 4px rgba(245, 158, 11, 0.3)' : 'none'
                  }}
                >
                  A-Z Capital
                </button>
              </div>
            )}

            {/* Focus vs All Selector */}
            <div style={{ display: 'flex', gap: '0.3rem', background: '#F1F5F9', padding: '0.2rem', borderRadius: '9999px' }}>
              <button
                onClick={() => {
                  playPop();
                  setViewFilter('focus');
                }}
                style={{
                  border: 'none',
                  background: viewFilter === 'focus' ? 'white' : 'transparent',
                  color: viewFilter === 'focus' ? '#4F46E5' : '#64748B',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  boxShadow: viewFilter === 'focus' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {isHindi ? '🌟 मुख्य अभ्यास' : (isBengali ? '🌟 বিশেষ বর্ণসমূহ' : '🌟 Dyslexia Focus')}
              </button>
              <button
                onClick={() => {
                  playPop();
                  setViewFilter('all');
                }}
                style={{
                  border: 'none',
                  background: viewFilter === 'all' ? 'white' : 'transparent',
                  color: viewFilter === 'all' ? '#4F46E5' : '#64748B',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  boxShadow: viewFilter === 'all' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {isHindi ? '🔤 पूरी वर्णमाला' : (isBengali ? '🔤 সম্পূর্ণ বর্ণমালা' : '🔤 All Letters')}
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Bar */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            padding: '0.3rem 0.2rem',
            scrollBehavior: 'smooth'
          }}
        >
          {letterList.map((ch) => {
            const isSelected = selectedLetter === ch;
            return (
              <button
                key={ch}
                onClick={() => {
                  playPop();
                  setSelectedLetter(ch);
                }}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  border: isSelected ? '2.5px solid #4F46E5' : '1.5px solid #E2E8F0',
                  background: isSelected ? '#EEF2FF' : 'white',
                  color: isSelected ? '#4338CA' : '#1E293B',
                  fontWeight: '800',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: isSelected ? '0 4px 10px rgba(79, 70, 229, 0.25)' : 'none',
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.15s ease'
                }}
              >
                {ch}
              </button>
            );
          })}
        </div>
      </div>

      {/* Instruction & Demo Button */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)',
          padding: '0.65rem 1rem',
          borderRadius: '18px',
          border: '1.5px solid #FDE68A',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem'
        }}
      >
        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#92400E', textAlign: 'left' }}>
          {currentTarget.instruction}
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <button
            onClick={handleDemonstration}
            disabled={isDemonstrating}
            style={{
              background: '#F59E0B',
              color: 'white',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)'
            }}
            title="Watch Mitra Demonstrate"
          >
            <PlayCircle size={14} />
            <span>Show Me</span>
          </button>

          <button
            onClick={() => speakText(currentTarget.audioText)}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#B45309',
              flexShrink: 0
            }}
            title="Hear Audio"
          >
            <Volume2 size={15} />
          </button>
        </div>
      </div>

      {/* Canvas Tracing Arena */}
      <div
        style={{
          position: 'relative',
          width: '280px',
          height: '280px',
          margin: '0 auto 0.75rem',
          borderRadius: '24px',
          background: '#FFFFFF',
          border: '3px dashed #CBD5E1',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04)',
          touchAction: 'none'
        }}
      >
        {/* Letter Background Template (100% Aligned SVG Path) */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
          viewBox="0 0 280 280"
        >
          {/* Outer Thick Light Grey Stroke (32px width) - Gives clear visible letter body */}
          <path
            d={currentTarget.svgPath || generateSvgPathFromDots(currentTarget.guideDots)}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Dashed Center Guide Line (3px width) - Shows target path through dots */}
          <path
            d={currentTarget.svgPath || generateSvgPathFromDots(currentTarget.guideDots)}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="3"
            strokeDasharray="6 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>



        {/* Magnetic Guide Dots */}
        {currentTarget.guideDots.map((dot) => {
          const isCollected = collectedDotIds.has(dot.id);
          const isPulsing = (tracingStatus === 'need_dot' && dot.label?.includes('Dot')) ||
                            (tracingStatus === 'need_cross' && dot.label?.includes('Cross')) ||
                            (tracingStatus === 'in_progress' && !isCollected);
          return (
            <div
              key={dot.id}
              style={{
                position: 'absolute',
                left: `${dot.x}px`,
                top: `${dot.y}px`,
                transform: 'translate(-50%, -50%)',
                width: dot.label ? (dot.label.length > 3 ? '44px' : '26px') : '16px',
                height: dot.label ? '24px' : '16px',
                borderRadius: '9999px',
                background: isCollected ? '#10B981' : isPulsing ? '#F59E0B' : dot.label ? '#F59E0B' : '#818CF8',
                border: isCollected ? '2.5px solid #D1FAE5' : isPulsing ? '2.5px solid #FEF3C7' : '2px solid white',
                boxShadow: isCollected ? '0 0 14px #10B981' : isPulsing ? '0 0 16px #F59E0B' : '0 2px 6px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                pointerEvents: 'none',
                zIndex: 5,
                animation: isPulsing ? 'gentle-bounce 1.5s infinite' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {isCollected ? '✓' : dot.label || ''}
            </div>
          );
        })}

        {/* Particle Canvas Layer */}
        <canvas
          ref={particleCanvasRef}
          width={280}
          height={280}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 8
          }}
        />

        {/* Active Drawing Canvas */}
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            position: 'absolute',
            inset: 0,
            cursor: 'crosshair',
            zIndex: 10
          }}
        />
      </div>

      {/* Progress & Dot Counter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '280px', margin: '0 auto 0.75rem', fontSize: '0.8rem', fontWeight: '800', color: '#475569' }}>
        <span>Dots Completed: {collectedCount} / {totalGuideDots}</span>
        <span>Strokes: {drawnStrokes.length}</span>
      </div>

      {/* Guided Helper / Status Feedback */}
      {tracingStatus === 'need_dot' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#B45309', background: '#FEF3C7', padding: '0.45rem 0.75rem', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          <AlertCircle size={18} color="#D97706" />
          <span>Almost done! Now tap the dot on top! 👆</span>
        </div>
      )}

      {tracingStatus === 'need_cross' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#4338CA', background: '#EEF2FF', padding: '0.45rem 0.75rem', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          <AlertCircle size={18} color="#4F46E5" />
          <span>Great line! Now draw the crossbar across! ➔</span>
        </div>
      )}

      {tracingStatus === 'in_progress' && !feedbackError && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#1E40AF', background: '#DBEAFE', padding: '0.45rem 0.75rem', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          <Sparkles size={18} color="#2563EB" />
          <span>Keep going! Trace along the letter shape!</span>
        </div>
      )}

      {feedbackError && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#DC2626', background: '#FEE2E2', border: '1.5px solid #FCA5A5', padding: '0.55rem 0.85rem', borderRadius: '14px', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.75rem', boxShadow: '0 2px 8px rgba(220, 38, 38, 0.15)' }}>
          <AlertCircle size={18} color="#DC2626" />
          <span>{feedbackError}</span>
        </div>
      )}

      {tracingStatus === 'success' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#059669', fontWeight: '700', fontSize: '1rem', marginBottom: '0.75rem' }}>
          <CheckCircle size={20} color="#10B981" />
          <span>Wonderful Tracing! Perfect Letter Overlap! +5 Stars</span>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={handleUndo}
          disabled={drawnStrokes.length === 0 || tracingStatus === 'success'}
          className="btn btn-secondary btn-pill"
          style={{ gap: '0.35rem', padding: '0.4rem 0.85rem', fontSize: '0.82rem', opacity: drawnStrokes.length === 0 ? 0.5 : 1 }}
        >
          <Undo2 size={15} />
          <span>Undo Stroke</span>
        </button>

        <button
          onClick={resetCanvas}
          className="btn btn-secondary btn-pill"
          style={{ gap: '0.35rem', padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
        >
          <RotateCcw size={15} />
          <span>Clear Canvas</span>
        </button>

        <button
          onClick={() => {
            playPop();
            const currentIdx = letterList.indexOf(selectedLetter);
            const nextIdx = (currentIdx + 1) % letterList.length;
            setSelectedLetter(letterList[nextIdx]);
          }}
          className="btn btn-primary btn-pill"
          style={{ gap: '0.35rem', padding: '0.4rem 1.15rem', fontSize: '0.85rem' }}
        >
          <span>Next Letter</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
