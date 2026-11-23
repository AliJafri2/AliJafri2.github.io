// Cuts the subject out of a photo and places it on a solid background.
// usage: swift scripts/headshot.swift <photo> <out.jpg|out.png> <hex color | none> <top> <bottom> <aspect w/h> [centerX]
//   "none" leaves the background transparent (write a .png); the site then paints the backdrop in CSS.
//   top/bottom: crop edges as a fraction of the photo height, e.g. 0.14 0.78
import Foundation
import Vision
import CoreImage
import CoreImage.CIFilterBuiltins

let a = CommandLine.arguments
guard let subject = CIImage(contentsOf: URL(fileURLWithPath: a[1]), options: [.applyOrientationProperty: true]) else { fatalError("load") }
let transparent = a[3] == "none"
let hex = transparent ? "000000" : a[3].replacingOccurrences(of: "#", with: "")
let v = Int(hex, radix: 16)!
let color = transparent ? CIColor(red: 0, green: 0, blue: 0, alpha: 0)
  : CIColor(red: CGFloat((v >> 16) & 255) / 255, green: CGFloat((v >> 8) & 255) / 255, blue: CGFloat(v & 255) / 255)
let SW = subject.extent.width, SH = subject.extent.height
let top = Double(a[4])! * SH, bottom = Double(a[5])! * SH, aspect = Double(a[6])!
let cx = (a.count > 7 ? Double(a[7])! : 0.476) * SW
let ch = bottom - top, cw = ch * aspect
let crop = CGRect(x: cx - cw / 2, y: SH - bottom, width: cw, height: ch)

let handler = VNImageRequestHandler(ciImage: subject)
let req = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([req])
guard let obs = req.results?.first else { fatalError("no subject") }
let raw = CIImage(cvPixelBuffer: try obs.generateScaledMaskForImage(forInstances: obs.allInstances, from: handler))
let choke = CIFilter.morphologyMinimum()
choke.inputImage = raw.clampedToExtent(); choke.radius = 3
let mask = choke.outputImage!.applyingGaussianBlur(sigma: 1.5).cropped(to: subject.extent)

let blend = CIFilter.blendWithMask()
blend.inputImage = subject
blend.backgroundImage = CIImage(color: color).cropped(to: crop)
blend.maskImage = mask
var out = blend.outputImage!.cropped(to: crop)
out = out.transformed(by: CGAffineTransform(translationX: -crop.minX, y: -crop.minY))
let k = 1200 / cw
out = out.transformed(by: CGAffineTransform(scaleX: k, y: k))
let srgb = CGColorSpace(name: CGColorSpace.sRGB)!
if a[2].lowercased().hasSuffix(".png") {
  try CIContext().writePNGRepresentation(of: out, to: URL(fileURLWithPath: a[2]), format: .RGBA8, colorSpace: srgb)
} else {
  try CIContext().writeJPEGRepresentation(of: out, to: URL(fileURLWithPath: a[2]), colorSpace: srgb,
    options: [kCGImageDestinationLossyCompressionQuality as CIImageRepresentationOption: 0.88])
}
print("ok", out.extent)
