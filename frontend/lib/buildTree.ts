export function buildTree(files: string[]){
    const tree: any ={}
    files.forEach((file)=>{
        const parts = file.split("/")
        let current = tree
        parts.forEach((part,index)=>{
            if(!current[part]){
                current[part] = index === parts.length -1 ? null:{}
            }
            current = current[part]

        })
    })
    return tree
}