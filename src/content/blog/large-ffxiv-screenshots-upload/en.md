---
title: "Uploading large FFXIV screenshots: protect quality and browser performance"
description: "Understand the 50 MB limit, prepare large screenshots safely, and use browser optimization without losing the details that matter in the final PNG."
date: "2026-08-22"
updated: "2026-08-22"
category: "Files and performance"
tags: ["ffxiv", "performance", "image-size"]
---

High-resolution GPose screenshots look great, but a browser editor uses both the file size and the device's memory. XIV Frame reads the selected file in your browser instead of sending the original to an image server. The upload limit is therefore a practical safety boundary for completing an edit reliably, especially on mobile.

## Limits to know

- Each photo or composite image must be **50 MB or smaller**.
- A canvas can contain up to four photos.
- Large photo dimensions may be optimized in the browser into an editing size up to 4096 px on the long side.
- Background removal needs additional memory because a model runs on the device.
- A file over 50 MB is rejected before browser optimization can begin.

This limit is not a promise that the original is stored on a server. It helps prevent a single tab from consuming too much memory while the canvas and background-removal worker are active.

## 1. Check the file before selecting it

1. Confirm that the file is a real PNG, JPG, or WebP image rather than only a renamed extension.
2. Check the file size in the file details. Renaming a file does not change its size or format.
3. Select only the views you actually need. Four large images can still be heavy even when each one passes the individual limit.
4. Test a background-removal image by itself before adding more elements. This keeps the cause of a failure clear.

## 2. Choose a format for the job

JPG or WebP can be lighter for an ordinary screenshot with no transparent area. PNG is a better fit when transparency, crisp UI text, or a logo edge must remain intact. There is no single best format; choose based on whether the file is a photograph or a transparent overlay.

If a file is too large, reduce its dimensions first when the long side is much larger than the publishing target. If you convert a photo to JPG or WebP, lower quality gradually and check faces, small text, and thin lines before saving. Do not use a format conversion to hide a broken or renamed file.

## 3. Keep the browser responsive

1. Close unrelated tabs that hold large images or video.
2. Add a representative screenshot first, choose the layout, then add the remaining images.
3. Do not refresh while the background-removal model is preparing or processing.
4. On mobile, finish removal and brush refinement for one image before starting the next.
5. If the browser closes a tab or the result becomes empty, check available memory and storage before repeatedly retrying.

## 4. Check quality at three scales

- **Small preview:** check overall balance, order, margins, and whether text is crowded.
- **Around 100%:** check faces, thin lines, composite edges, and copyright text.
- **Close inspection:** check halos, brush marks, and shadow edges, then return to the full canvas for the final balance.

Canvas zoom changes how you inspect the work; it does not by itself increase the downloaded image's resolution. Enlarging a composite element to 500% helps position it, but it cannot create detail that was not present in the source.

## 5. If an upload fails

1. Confirm the file is under 50 MB.
2. Save a smaller copy in PNG, JPG, or WebP and select the new file.
3. Try a different image. If the smaller copy works, the original's size or encoding is the likely cause.
4. If every image fails, check the browser and device rather than changing the same file repeatedly.
5. Remember that layout and signature settings may persist locally, but selected screenshot files need to be chosen again after a refresh.
6. For mobile background-removal failures, test ordinary photo upload separately from automatic removal to distinguish model preparation from file validation.

## A practical export rule

Keep an original archive and a lighter publishing copy. For a social preview, match the long side to the destination's real display size. For printing or future editing, keep the original separately. XIV Frame does not keep a project file on the server, so storing the source screenshots beside the exported PNG makes a later revision much easier.

Removing the limit without considering device memory would not make every device more reliable. A smaller, valid input lets the browser optimization and canvas rendering complete predictably.
