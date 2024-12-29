'use client'

import { useRef, useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Download, Upload, Scissors, Zap, ImageIcon, Sparkles, Wand2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function StencilEditor() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [settings, setSettings] = useState({
    threshold: 128,
    edgeStrength: 1,
    invert: false
  })
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          setImage(img)
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const processImage = () => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = image.width
    canvas.height = image.height
    ctx.drawImage(image, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    if (settings.edgeStrength > 0) {
      applySobelEdgeDetection(data, canvas.width, canvas.height, settings.edgeStrength)
    }

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
      const binary = brightness > settings.threshold ? 255 : 0
      data[i] = data[i + 1] = data[i + 2] = binary
    }

    if (settings.invert) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i]
        data[i + 1] = 255 - data[i + 1]
        data[i + 2] = 255 - data[i + 2]
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const applySobelEdgeDetection = (
    data: Uint8ClampedArray, 
    width: number, 
    height: number,
    strength: number
  ) => {
    const tempData = new Uint8ClampedArray(data)
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4
        
        const gx = (
          -1 * tempData[((y-1) * width + (x-1)) * 4] +
          1 * tempData[((y-1) * width + (x+1)) * 4] +
          -2 * tempData[(y * width + (x-1)) * 4] +
          2 * tempData[(y * width + (x+1)) * 4] +
          -1 * tempData[((y+1) * width + (x-1)) * 4] +
          1 * tempData[((y+1) * width + (x+1)) * 4]
        )
        
        const gy = (
          -1 * tempData[((y-1) * width + (x-1)) * 4] +
          -2 * tempData[((y-1) * width + x) * 4] +
          -1 * tempData[((y-1) * width + (x+1)) * 4] +
          1 * tempData[((y+1) * width + (x-1)) * 4] +
          2 * tempData[((y+1) * width + x) * 4] +
          1 * tempData[((y+1) * width + (x+1)) * 4]
        )
        
        const magnitude = Math.sqrt(gx * gx + gy * gy) * strength
        
        data[idx] = magnitude
        data[idx + 1] = magnitude
        data[idx + 2] = magnitude
      }
    }
  }

  const downloadImage = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = 'stencil.png'
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  useEffect(() => {
    if (image) {
      processImage()
    }
  }, [image, settings])

  return (
    <div className="min-h-screen dark bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
        <div className="container flex h-16 items-center">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-purple-600/20 p-2">
              <Scissors className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">Stencilify</span>
              <Badge variant="outline" className="ml-2 border-purple-800/50 bg-purple-500/10 text-purple-300">
                2.0
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative text-center mb-16">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-48 w-48 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>
          <div className="relative">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white">
              Convierte tus Diseños en{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Stencils Perfectos
              </span>
            </h1>
            
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-3 mb-16 max-w-5xl mx-auto">
          <Card className="group relative overflow-hidden border-white/5 bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-all duration-300">
            <CardHeader className="relative p-3">
              <div className="flex items-start space-x-3">
                <div className="inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 ring-1 ring-purple-500/20">
                  <Wand2 className="h-4 w-4 text-purple-400" />
                </div>
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-base font-semibold text-gray-100">Optimización Inteligente</CardTitle>
                  <CardDescription className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                    Nuestro motor de procesamiento analiza y optimiza cada detalle de tu diseño, asegurando líneas nítidas y sombras perfectamente definidas.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="group relative overflow-hidden border-white/5 bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-all duration-300">
            <CardHeader className="relative p-3">
              <div className="flex items-start space-x-3">
                <div className="inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 ring-1 ring-purple-500/20">
                  <Zap className="h-4 w-4 text-purple-400" />
                </div>
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-base font-semibold text-gray-100">Precisión Profesional</CardTitle>
                  <CardDescription className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                    Controla cada aspecto de tu stencil con herramientas diseñadas por y para profesionales. Ajusta umbrales y bordes con precisión.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="group relative overflow-hidden border-white/5 bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-all duration-300">
            <CardHeader className="relative p-3">
              <div className="flex items-start space-x-3">
                <div className="inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 ring-1 ring-purple-500/20">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                </div>
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-base font-semibold text-gray-100">Resultados Superiores</CardTitle>
                  <CardDescription className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                    Obtén stencils de calidad excepcional listos para transferir. Garantizamos la máxima fidelidad en cada detalle.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Editor Card */}
        <Card className="relative overflow-hidden border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent"></div>
          <CardHeader className="relative border-b border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-gray-100">Laboratorio de Stencils</CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  Tu espacio de trabajo profesional para crear stencils perfectos
                </CardDescription>
              </div>
              {!image && (
                <Button 
                  onClick={() => inputRef.current?.click()} 
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20 transition-all hover:shadow-purple-900/40"
                  size="lg"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Subir Imagen
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="relative p-6">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {image ? (
              <div className="grid md:grid-cols-[300px,1fr] gap-8">
                <Card className="border-white/5 bg-black/40 h-min">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-200">Umbral de Detalle</Label>
                        <p className="text-xs text-gray-400 mb-2">Ajusta la sensibilidad de captura de detalles</p>
                        <div className="mt-2">
                          <Slider
                            value={[settings.threshold]}
                            onValueChange={([threshold]) => 
                              setSettings(prev => ({ ...prev, threshold }))
                            }
                            max={255}
                            step={1}
                            className="py-2"
                          />
                        </div>
                      </div>

                      <Separator className="bg-white/5" />

                      <div>
                        <Label className="text-sm font-medium text-gray-200">Definición de Bordes</Label>
                        <p className="text-xs text-gray-400 mb-2">Controla la nitidez de las líneas</p>
                        <div className="mt-2">
                          <Slider
                            value={[settings.edgeStrength]}
                            onValueChange={([edgeStrength]) => 
                              setSettings(prev => ({ ...prev, edgeStrength }))
                            }
                            max={5}
                            step={0.1}
                            className="py-2"
                          />
                        </div>
                      </div>

                      <Separator className="bg-white/5" />

                      <Button
                        onClick={() => setSettings(prev => ({ ...prev, invert: !prev.invert }))}
                        variant="outline"
                        className="w-full border-white/10 bg-black/20 text-gray-200 hover:bg-black/40 hover:text-white"
                      >
                        Invertir Colores
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="relative rounded-xl border border-white/5 bg-black/40 p-4 max-h-[600px] overflow-auto">
                  <div className="relative min-h-[500px] flex items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      className="max-w-full max-h-[500px] object-contain rounded-lg"
                    />
                    <Button
                      onClick={downloadImage}
                      className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20 transition-all hover:shadow-purple-900/40"
                      size="lg"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Descargar Stencil
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-lg bg-purple-500/10 p-4 mb-4">
                  <ImageIcon className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-200 mb-2">
                  Comienza Tu Obra Maestra
                </h3>
                <p className="text-gray-400 text-center max-w-md mb-6">
                  Sube tu diseño y déjanos ayudarte a crear un stencil perfecto para tu próximo tatuaje. Aceptamos PNG, JPG y otros formatos de imagen comunes.
                </p>
                <Button 
                  onClick={() => inputRef.current?.click()} 
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20 transition-all hover:shadow-purple-900/40"
                  size="lg"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Subir Imagen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            Stencilify — Transformando el arte del tatuaje, un stencil a la vez
          </p>
        </footer>
      </div>
    </div>
  )
}

