# Local TRELLIS attempt

## Route and current status

Local conversion has succeeded on this machine using the existing RTX 3050 and quantized weights. All six weights passed their exact size and SHA256 checks. Both the one-step GPU smoke run and a separate run with the upstream default **12 sampler steps** produced valid GLBs. The normal-quality conversion completed in **262.8 seconds**. These are dense, untextured source models; mobile cleanup and visual acceptance remain required.

The inspected route is [pwilkin/trellis.cpp](https://github.com/pwilkin/trellis.cpp), pinned to release **v0.8.1**. The portable Windows Vulkan archive includes a CPU backend. Its 14,131,887-byte archive was downloaded directly from the upstream release and verified against GitHub's published SHA256 digest:

`d6c70678635f5367f9aa93261e9310e7c0c327ca8395399cf2ef869ccc2e72ba`

The actual portable `trellis-cli.exe --help` ran successfully. No installer, desktop app, Python ML environment or system-wide package was installed. Pinned CLI source was inspected before execution. Its model objects are loaded and freed per pipeline stage, and it accepts explicit CPU execution. This is CPU-only inference; it is not a demonstrated GPU/RAM split of the same stage. The [upstream getting-started documentation](https://raw.githubusercontent.com/pwilkin/trellis.cpp/main/docs/getting-started.md) also describes quantized weights and portable operation.

## Model subset

The weight source is [ilintar/trellis2-gguf](https://huggingface.co/ilintar/trellis2-gguf/tree/main), pinned to commit `a57397bd3d351599d9729fc144b3f87c3f87d65b`. Each download must match the repository's exact byte size and LFS SHA256 digest before use.

| File | Bytes |
| --- | ---: |
| BiRefNet matte | 882,749,024 |
| DINOv3 conditioning | 172,662,976 |
| Sparse-structure flow | 730,496,672 |
| Sparse-structure decoder | 147,379,392 |
| 512 shape flow | 730,520,576 |
| Shape decoder | 845,423,552 |
| **Total** | **3,509,232,192** |

Texture and 1024-resolution flow weights are excluded from this geometry-only smoke test. BiRefNet is included to avoid replacing the exact approved concept with a white-threshold matte that can damage bright armor details. Input is `art/concepts/relic-marshal-v1.png`, preserved unchanged.

## Run limits and evidence

Hardware context: RTX 3050 with 4 GB VRAM, approximately 15.4 GiB visible system RAM. Before downloads the desktop had roughly 5.2 GiB free RAM and 192 GiB free disk; Blender and game work continue in parallel.

`tools/trellis_local_probe.py` downloads the selected files to ignored `tools/vendor/trellis-local`. The first run selects CPU, requests four GGML CPU threads, and uses below-normal process priority, resolution 512, seed 42, one sampler step, BiRefNet and no texture stage. It has a 600-second inference ceiling and stops if free physical RAM falls below 768 MiB.

Initial long HTTP responses ended early. The 544,315,738-byte BiRefNet partial and 72,295,576-byte DINO partial were retained. A 64-byte range probe against the same pinned source returned HTTP 206 and the exact requested `Content-Range` for both partials and the shape-flow file. Downloads then resumed in 32 MiB ranges, validated each range header, preserved bytes on interruption, and verified the final whole-file SHA256. All six completed and passed those checks without another range error. The download phase had a separate 1,800-second ceiling.

The CPU run completed background removal and DINO conditioning, then reached sparse-structure flow. It stopped at the 600-second cutoff (601.2 seconds measured) without a GLB. Peak process working set was 4,039,282,688 bytes (3.76 GiB). The memory floor did not trigger. This is a bounded timeout, not proof that CPU conversion is impossible.

The release archive omits `trellis-devices`, so the inventory was obtained directly from its bundled GGML DLLs without loading model weights. It identified AMD integrated graphics as `Vulkan0` and the discrete RTX 3050 as `Vulkan1`. The second attempt explicitly selected `Vulkan1`, disabled the multi-backend scheduler, and required GPU execution. It reused the CPU-produced BiRefNet cutout, whose existing alpha is preserved; it did not apply a white threshold to the bright armor.

That one-step GPU attempt completed successfully in **153.9 seconds**. The highest observed whole-device GPU-memory sample was **2,761 MiB** out of 4,096 MiB; samples were taken approximately every five seconds, so this is not a continuous GPU allocation peak. Peak process working set was **3,023,081,472 bytes (2.82 GiB)**. Output metadata and a streamed binary inspection confirmed GLB 2.0, matching file length, finite vertex coordinates and in-range triangle indices:

| Output | One-step smoke | Normal 12-step |
| --- | ---: | ---: |
| File size | 115,307,432 bytes | 53,760,256 bytes |
| Vertices | 2,816,939 | 1,404,718 |
| Triangles | 6,791,944 | 3,075,234 |
| Materials / textures / skins / animations | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |

Raw GLB and PLY files remain local and ignored by Git. The source's geometry-only path skips its textured remesh/decimation block, so its advertised decimation default does not reduce this export. A separate reduction and visual inspection are required before preview or engine import. The raw dense model must not be loaded into the browser game.

The 12-step pass used the same pinned weights, cutout, resolution and seed, with a separate `relic-marshal-vulkan-quality12` output/receipt and a 900-second ceiling. It completed with exit code zero in **262.8 seconds**. Sparse-structure sampling took 128.1 seconds and shape sampling took 73.9 seconds. Peak process working set was **1,698,324,480 bytes (1.58 GiB)**; the highest sampled whole-device GPU memory was **1,473 MiB**. Free physical RAM never fell below **3,477,000,192 bytes (3.24 GiB)**. No allocation failure or memory-floor stop occurred.

The normal-quality GLB also passed streamed finite-coordinate and triangle-index checks in `tools/trellis_glb_metadata.py`. Its metrics are saved separately as `relic-marshal-vulkan-quality12.mesh.json`. The original concept and raw geometry remain preserved. A fast vertex-clustered preview produced 37,240 triangles and a 774,252-byte GLB, but its render showed severe triangular perforations; this reduction was rejected. It must not be used to judge raw conversion quality or replace the game character.

The untouched 3,075,234-triangle GLB was subsequently imported into Blender and rendered directly on the CPU. The inspected render is `assets/experiments/trellis-local/relic-marshal-vulkan-quality12-preview-raw-front.png`. Broad armor plates, chest relic, helmet, shoulder rings, weapon, hands and legs are recognizable. Dense contour/ripple noise and thin/open edges remain. The raw model uses Y-up and faces +X. Blender's measured peak working set was about 1.68 GiB. This is a reconstruction starting point, not accepted production art. The 4,000-triangle commander target, clean topology, textures, rigging and animation remain pending; the current game character is preserved.

Execution evidence is retained in `assets/experiments/trellis-local`: separate CPU/smoke/quality receipts, memory samples, device inventory, streamed mesh metrics, stdout/stderr, the cutout and raw models. Logs and raw GLB/PLY files are ignored by Git. The one-step output remains a runtime smoke test; the 12-step output is an original-image-derived geometry candidate awaiting visual acceptance, cleanup, materials and rigging. All inference processes have exited.

The runtime is MIT licensed. Pinned runtime and model-card notices are retained under ignored `tools/vendor/trellis-local/notices`. The quantized weight card declares `other` licensing; each component's terms require separate review before redistribution. The weights are excluded from the game and repository. Runtime licensing does not establish that the whole model stack is MIT licensed.
