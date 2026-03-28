import ImageKit from "imagekit"
import { NextResponse } from "next/server"

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
})

export async function POST(req: Request){
    const {file,fileName} = await req.json()
    const res = await imagekit.upload({
        file,
        fileName,
        folder: "cortex",
    })
    return NextResponse.json({url:res.url})
}