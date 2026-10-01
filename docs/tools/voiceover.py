# Dev tool: add an AI voice-over (Indian English, Microsoft neural TTS via edge-tts) to the demo video.
# Usage: python docs/tools/voiceover.py [preset] [in.mp4] [out.mp4]
#   preset: A (young female, natural - default) | B (younger female, peppier) | plain | boy (young male)
# Each line is synthesised separately and placed at its scene's start time, so the voice stays in sync
# with the video even if one line comes out a little longer or shorter.
import asyncio, os, re, subprocess, sys, tempfile
import edge_tts

PRESETS = {
    'A': dict(voice='en-IN-NeerjaExpressiveNeural', rate='+4%', pitch='+6Hz'),
    'B': dict(voice='en-IN-NeerjaExpressiveNeural', rate='+7%', pitch='+12Hz'),
    'plain': dict(voice='en-IN-NeerjaNeural', rate='+0%', pitch='+0Hz'),
    'boy': dict(voice='en-IN-PrabhatNeural', rate='+5%', pitch='+4Hz'),  # young male
}
preset = sys.argv[1] if len(sys.argv) > 1 else 'A'
src = sys.argv[2] if len(sys.argv) > 2 else 'docs/demo/HoneyChain-demo-3min.mp4'
out = sys.argv[3] if len(sys.argv) > 3 else 'docs/demo/HoneyChain-demo-voiceover.mp4'
FFMPEG = os.path.join('node_modules', 'ffmpeg-static', 'ffmpeg.exe' if os.name == 'nt' else 'ffmpeg')

# (start second, end second, line) - times match the scene marks printed by record-demo.mjs.
# Acronyms are spelled with spaces so they are read letter by letter.
SCRIPT = [
    (0.4, 4.0, "Hi! This is Honey Chain."),
    (4.4, 25.9, "Honey Chain gives every hive, every harvest, and every jar of honey a tamper-proof identity on a blockchain. "
                "At the top, you can see real ledger blocks streaming live. And as we scroll, one batch of honey travels from the hive to the jar, in six simple steps."),
    (26.2, 43.0, "A buyer just scans the QR code on the jar. The app re-checks every hash, signature, and lab result. "
                 "This one is genuine, with a trust score of one hundred, its village of origin, full lab results, and the complete journey."),
    (43.3, 59.6, "Now, a fake. It claims ninety-five kilos from one hive and fails the lab: trust score twenty, do not buy. "
                 "Clever syrup still fails N M R, and a forged QR code is caught instantly."),
    (59.9, 80.4, "Beekeepers register a harvest in just three taps: pick the hives, enter the kilos and the flowers. "
                 "Every ledger entry prints a signed receipt, with the block hash, the validator, a barcode, and a QR code. Sealed on the chain, and torn off, just like a real one."),
    (80.7, 96.7, "The lab enters eight test results. Pass or fail is calculated automatically, and nobody can edit it. "
                 "Here the chemistry looks clean, but the N M R shows an anomaly, so the batch is rejected, permanently."),
    (97.0, 128.5, "Each hive has a low-cost sensor node that tracks weight, brood temperature, humidity, and the sound of the colony. "
                  "Our A I spots trouble early. This hive is about to swarm, with ninety-eight percent confidence, simple advice, and a thirty-day honey forecast. "
                  "In another hive, it catches foulbrood before it spreads, and fourteen days of sensor data are sealed on the chain as proof."),
    (128.8, 146.9, "Processors and retailers record every handover. The current holder fills in automatically, "
                   "and you can never pack more honey than was harvested. A batch that failed the lab simply cannot move."),
    (147.2, 161.2, "Now, let's try to cheat. If someone secretly edits an old record, the chain breaks at that exact block, and the alarm goes off instantly."),
    (161.5, 177.6, "For rollout, village sensor nodes connect over LoRa to offline-first cluster gateways, on a chain run by K V I C, F S S A I, and accredited labs. "
                   "Four phases, from a hundred-hive pilot to the whole country."),
    (177.9, 188.0, "And it's built for beekeepers, with Hindi and English, large text, and a simple mode."),
    (188.3, 192.9, "Every drop, proven. Thank you!"),
]


def duration(path):
    err = subprocess.run([FFMPEG, '-hide_banner', '-i', path], capture_output=True, text=True).stderr
    h, m, s = re.search(r'Duration: (\d+):(\d+):([\d.]+)', err).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


async def synth(text, path, p):
    await edge_tts.Communicate(text, p['voice'], rate=p['rate'], pitch=p['pitch']).save(path)


async def main():
    p = PRESETS[preset]
    tmp = tempfile.mkdtemp(prefix='hc-vo-')
    clips = []
    for i, (start, end, text) in enumerate(SCRIPT):
        f = os.path.join(tmp, f'line{i:02}.mp3')
        await synth(text, f, p)
        d, slot = duration(f), end - start
        # If a line overruns its scene, speed it up a little (never more than 12%, which still sounds natural).
        tempo = min(1.12, d / slot) if d > slot else 1.0
        flag = '  <-- still long, shorten this line' if d / tempo > slot + 0.3 else ''
        print(f'{start:6.1f}s  {d:5.1f}s / {slot:4.1f}s slot  x{tempo:.2f}{flag}')
        clips.append((start, f, tempo))

    video_len = duration(src)
    args = [FFMPEG, '-y', '-i', src]
    for _, f, _ in clips:
        args += ['-i', f]
    chains = [f"[{i + 1}:a]atempo={t:.3f},adelay={int(s * 1000)}|{int(s * 1000)}[v{i}]" for i, (s, _, t) in enumerate(clips)]
    mix = ''.join(f'[v{i}]' for i in range(len(clips)))
    # mix the lines, then gentle compression + broadcast loudness so the voice sounds even and present
    graph = ';'.join(chains) + f";{mix}amix=inputs={len(clips)}:normalize=0,apad=whole_dur={video_len:.2f}," \
            "acompressor=threshold=-18dB:ratio=2.5:attack=5:release=120,loudnorm=I=-16:TP=-1.5:LRA=9[a]"
    args += ['-filter_complex', graph, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
             '-t', f'{video_len:.2f}', '-movflags', '+faststart', out]
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode:
        print(r.stderr[-1500:])
        sys.exit(1)
    print(f'saved {out} ({os.path.getsize(out) / 1e6:.1f} MB, voice {p["voice"]} {p["rate"]} {p["pitch"]})')

asyncio.run(main())
