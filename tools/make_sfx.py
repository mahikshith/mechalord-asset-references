"""Synthesise the side-scroller's sound effects from scratch (original, no licence
strings attached): rifle shot, enemy shot, impact tick, armour clang, explosion,
heavy shell blast, laser beam loop, splash and hero hurt. 44.1 kHz 16-bit mono WAV.

Run: python tools/make_sfx.py <out_dir>
"""
import os
import sys
import wave
import numpy as np

SR = 44100
rng = np.random.default_rng(7)
OUT = sys.argv[1] if len(sys.argv) > 1 else 'sfx'
os.makedirs(OUT, exist_ok=True)


def t(sec):
    return np.arange(int(SR * sec)) / SR


def env(n, attack=0.002, decay=0.1):
    x = np.arange(n) / SR
    a = np.clip(x / max(attack, 1e-5), 0, 1)
    return a * np.exp(-x / decay)


def lowpass(x, cutoff):
    # one-pole low-pass
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def save(name, x, gain=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    data = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def rifle_shot():
    n = int(SR * 0.32)
    noise = rng.standard_normal(n)
    crack = highpass(noise, 1800) * env(n, 0.0005, 0.018)
    body = lowpass(noise, 2400) * env(n, 0.001, 0.06)
    thump = np.sin(2 * np.pi * 95 * t(0.32)) * env(n, 0.001, 0.05)
    tail = lowpass(rng.standard_normal(n), 600) * env(n, 0.01, 0.14) * 0.35
    return crack * 0.9 + body * 0.7 + thump * 0.8 + tail


def enemy_shot():
    n = int(SR * 0.28)
    x = t(0.28)
    zap = np.sin(2 * np.pi * (900 - 2400 * x) * x) * env(n, 0.001, 0.05)
    noise = lowpass(rng.standard_normal(n), 3000) * env(n, 0.0005, 0.03)
    return zap * 0.7 + noise * 0.6


def impact():
    n = int(SR * 0.12)
    return highpass(rng.standard_normal(n), 2500) * env(n, 0.0003, 0.02) + np.sin(2 * np.pi * 1900 * t(0.12)) * env(n, 0.0005, 0.015) * 0.4


def clang():
    n = int(SR * 0.5)
    x = t(0.5)
    tones = sum(np.sin(2 * np.pi * f * x) * a for f, a in ((620, 1.0), (1013, 0.6), (1587, 0.4), (2230, 0.25)))
    return tones * env(n, 0.0005, 0.12) + highpass(rng.standard_normal(n), 3000) * env(n, 0.0003, 0.01) * 0.6


def explosion(dur=1.6, boom=48, decay=0.45):
    n = int(SR * dur)
    x = t(dur)
    rumble = lowpass(rng.standard_normal(n), 300) * env(n, 0.004, decay)
    crack = highpass(rng.standard_normal(n), 1200) * env(n, 0.0008, 0.05)
    sub = np.sin(2 * np.pi * boom * x * (1 - 0.3 * x)) * env(n, 0.003, decay * 0.6)
    debris = lowpass(rng.standard_normal(n), 1800) * env(n, 0.05, decay * 1.4) * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * x)) * 0.25
    return rumble * 1.2 + crack * 0.5 + sub * 1.0 + debris


def laser_loop():
    dur = 1.0
    x = t(dur)
    f = 180 + 12 * np.sin(2 * np.pi * 6 * x)
    phase = 2 * np.pi * np.cumsum(f) / SR
    saw = 2 * ((phase / (2 * np.pi)) % 1.0) - 1
    hum = lowpass(saw, 1400) * 0.7 + np.sin(phase * 2) * 0.3
    hiss = highpass(rng.standard_normal(len(x)), 4000) * 0.12
    y = hum + hiss
    # crossfade the ends for a clean loop
    k = int(SR * 0.05)
    y[:k] = y[:k] * np.linspace(0, 1, k) + y[-k:] * np.linspace(1, 0, k)
    return y[:-k]


def splash():
    n = int(SR * 0.9)
    return lowpass(rng.standard_normal(n), 2200) * env(n, 0.01, 0.25) + highpass(rng.standard_normal(n), 3500) * env(n, 0.02, 0.12) * 0.4


def hurt():
    n = int(SR * 0.35)
    x = t(0.35)
    return np.sin(2 * np.pi * (330 - 200 * x) * x) * env(n, 0.001, 0.1) + clang()[:n] * 0.35


save('SFX_RifleShot', rifle_shot())
save('SFX_EnemyShot', enemy_shot(), 0.7)
save('SFX_Impact', impact(), 0.6)
save('SFX_ArmourClang', clang(), 0.7)
save('SFX_Explosion', explosion())
save('SFX_ShellBlast', explosion(2.2, 38, 0.7))
save('SFX_LaserLoop', laser_loop(), 0.6)
save('SFX_Splash', splash(), 0.7)
save('SFX_Hurt', hurt(), 0.8)
print('wrote', sorted(os.listdir(OUT)))
