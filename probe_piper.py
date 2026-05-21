from piper.voice import PiperVoice
import io, wave

voice = PiperVoice.load(
    '/home/app/Desktop/RND/voices/en_US-amy-medium.onnx',
    config_path='/home/app/Desktop/RND/voices/en_US-amy-medium.onnx.json'
)
print('sample_rate:', voice.config.sample_rate)

buf = io.BytesIO()
wf = wave.open(buf, 'wb')
voice.synthesize_wav('Rahul placed an order for Wash and Fold. Amount rupees 320.', wf)
wf.close()
wav_bytes = buf.getvalue()
print('wav bytes:', len(wav_bytes))
with open('/tmp/probe.wav', 'wb') as f:
    f.write(wav_bytes)
print('written /tmp/probe.wav')
