import ImageKit from 'imagekit-javascript'

export const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
})