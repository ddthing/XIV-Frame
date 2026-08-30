---
title: "XIV Frame compositing guide: remove backgrounds and place PNG elements"
description: "Remove a background from a character, light, or effect image in your browser, refine its edges, and place the element naturally over your screenshot."
date: "2026-08-22"
updated: "2026-08-31"
category: "Compositing"
tags: ["ffxiv", "composite", "background-removal"]
---

XIV Frame's **Composite** feature is not limited to character cutouts. It is useful for any separate image you want to place over a canvas: a transparent PNG, a light effect, a particle layer, a decoration, or an object from another screenshot. You can prepare the element and compare it with the base screenshots without opening a separate image editor.

## When to use this feature

- Place a character, light, effect, or decorative PNG over a screenshot.
- Remove the background from an image before layering it over an existing frame.
- Test several positions and scales while keeping the original screenshots unchanged.
- Refine a cutout on the same page and immediately judge its edge against the canvas.

If the source is already a transparent PNG, skip background removal. Add it as a composite image and adjust its size and position directly.

## 1. Prepare the source image

1. Use a browser-readable PNG, JPG, or WebP file.
2. Clear contrast between the subject and its background usually makes automatic removal easier to review.
3. Each image must be 50 MB or smaller. Large files are optimized in the browser after they pass validation; files over the limit are rejected before that step.
4. On mobile, test complex images one at a time so you can distinguish a processing issue from a file issue.

## 2. Add a composite image

1. On desktop, open the top **Image** tab, then choose **Composite** inside the **Image source** panel. On mobile, open the photo sheet and find the composite section.
2. Select **Add composite image** and choose the file.
3. Compare the **Original** preview with the **Background removal result** area.
4. If an element seems invisible on the canvas, check its preview, selected state, opacity, and position. A transparent result or an element placed outside the visible crop can look like a failed upload.

## 3. Run background removal

1. Select **Remove background**. The model runs in your browser, so the first run may take longer while it is prepared.
2. Keep the page open while the preparation or processing state is visible.
3. The image is processed in the current browser rather than uploaded to an XIV Frame image server. Processing time still depends on the device's memory and browser performance.
4. Review the result before deleting it. Small leftover areas are often faster to fix with the refinement brush than to recreate from another source.

## Read the error message first

Background-removal failures are separated by likely cause. Match the message you see to the recovery step instead of retrying the same file without a change.

| Message type | What it usually means | First action |
| --- | --- | --- |
| Model could not be prepared | The model files could not be downloaded or initialized | Check the connection, reload the page, and try again |
| Browser cannot run background removal | The available WebGPU/WASM runtime is not supported | Try the latest Chrome or Edge |
| Not enough memory | Decoding or model execution exceeded available memory | Use a smaller image and process one image at a time on mobile |
| Could not read or process image | File format, decode, or canvas processing issue | Save it again as PNG, JPG, or WebP and select it again |
| Processing took too long | The Worker did not finish within its time limit | Keep the page open, reduce the image size, and retry one image |
| Something went wrong | No more specific category was detected | Select **Try again**; if it repeats, include the browser, file type, and steps in a report |

If there is no error message and the result only looks empty, check the result preview, selected state, opacity, and canvas position first.

## 4. Refine with erase and restore

1. Choose **Erase** and drag over background that remains around the subject.
2. Choose **Restore** when part of the subject was removed. Restore uses the original information available to the editor, so it can recover useful areas after automatic removal.
3. Set the brush size before working. The circle shown over the preview represents the affected brush area: use a small brush for hair, weapons, and thin lines, and a larger brush for broad background areas.
4. Work in several short passes around complex edges instead of making one large stroke.
5. Use **Undo** for the last change or **Reset refinement** to return to the automatic result.

## 5. Place the element on the canvas

1. Drag the composite element in **Canvas placement** until it sits naturally over the screenshot.
2. The **Image size** range goes from 25% to 500%. If the cutout is smaller than the source photo, enlarge it before fine-tuning its position.
3. Lower opacity temporarily when you need to see the screenshot behind the element. Restore the final opacity after the overlap is correct.
4. On desktop, use the arrow keys for 1 px movement and Shift+arrow keys for 10 px movement while the element is selected.
5. On mobile, use **Position nudge**. The center button switches between 1 px and 10 px steps, and a long press can move repeatedly.
6. Use **Flip horizontally** only after checking the subject's gaze, weapon direction, and light direction against the base image.

## 6. Make the overlap believable

If the element looks like it is floating, check its position and opacity before increasing its scale. **Natural shadow** can help at a contact point such as feet or an object resting on a surface. For light and smoke effects, a lower opacity often works better than a heavy shadow. Turn the shadow off when it thickens the cutout edge.

## Troubleshooting order

| Symptom | First check | Next action |
| --- | --- | --- |
| The result looks empty | Result preview and selection state | Finish removal, then review canvas placement |
| Background remains | Brush mode and brush size | Erase small areas in separate passes |
| Part of the subject disappeared | Automatic result | Restore with a smaller brush |
| Processing takes a long time | First model preparation or mobile device | Keep the page open and process one image at a time |
| The element is too small | Image size value | Increase it within the 500% range |
| The element is no longer needed | Composite controls | Select **Remove composite**; photo and signature settings remain |

Before exporting, inspect the edge at close range, then return to a full-canvas view. Check that the element does not cover a face, weapon, signature, or other important detail. Export with **Export PNG** on desktop or **Export → Save Photo** on mobile. PNG is preferred; an opaque result over 5 MB is automatically downloaded as a high-quality JPEG, while a transparent PNG that cannot fit under 5 MB shows guidance instead of downloading.
