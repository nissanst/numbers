# Usage: python3 convert_voices.py <folder with *.m4a> <out folder>
# Converts exported recordings to 22050 Hz mono 16-bit WAV and trims silence at both ends.
import sys, os, struct, subprocess, glob, array
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
def read_wav(path):
    b = open(path, "rb").read(); i = 12; rate = 22050; data = b""
    while i + 8 <= len(b):
        cid = b[i:i+4]; sz = struct.unpack("<I", b[i+4:i+8])[0]
        if cid == b"fmt ": rate = struct.unpack("<I", b[i+12:i+16])[0]
        if cid == b"data": data = b[i+8:i+8+sz]; break
        i += 8 + sz + (sz & 1)
    a = array.array("h"); a.frombytes(data[:len(data)//2*2]); return a, rate
for f in sorted(glob.glob(os.path.join(src, "*.m4a"))):
    key = os.path.basename(f)[:-4]; tmp = os.path.join(out, key + ".tmp.wav")
    subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16@22050", "-c", "1", f, tmp], check=True)
    a, rate = read_wav(tmp); os.remove(tmp)
    peak = max(abs(v) for v in a) or 1; th = max(400, peak * 0.04); win = rate // 100
    env = [max(abs(v) for v in a[i:i+win]) for i in range(0, len(a), win)]
    idx = [i for i, e in enumerate(env) if e > th]
    s = max(0, (idx[0] - 8) * win); e = min(len(a), (idx[-1] + 26) * win)
    t = a[s:e]
    hdr = b"RIFF" + struct.pack("<I", 36 + len(t)*2) + b"WAVEfmt " + struct.pack("<IHHIIHH", 16, 1, 1, rate, rate*2, 2, 16) + b"data" + struct.pack("<I", len(t)*2)
    open(os.path.join(out, key + ".wav"), "wb").write(hdr + t.tobytes())
    print(key, round(len(a)/rate, 2), "->", round(len(t)/rate, 2), "s, peak", peak)
