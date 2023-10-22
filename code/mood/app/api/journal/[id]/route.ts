import { analyze } from "@/util/ai"
import { getUserByClerkID } from "@/util/auth"
import { prisma } from "@/util/db"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

export const PATCH = async (request: Request, {params}) => {
    const {content} = await request.json()
    const user = await getUserByClerkID()
    const updatedEntry = await prisma.journalEntry.update({
        where: {
            userId_id: {
                userId: user.id,
                id: params.id
            }
        },
        data: {
            content,
        },
    })
    const analysis = await analyze(updatedEntry.content)
    const updated = await prisma.analysis.upsert({
        where: {
            entryId: updatedEntry.id,
        },
        create: {
            userId: user.id,
            entryId: updatedEntry.id,
            ...analysis
        },
        update: analysis
    })
    return NextResponse.json({data: {...updatedEntry, analysis: updated}})
}