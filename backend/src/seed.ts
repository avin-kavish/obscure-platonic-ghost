import { subDays, subMinutes, subWeeks } from "date-fns"
import 'dotenv/config'
import { prisma } from "./prisma/client"

(async () => {
  await prisma.upvote.deleteMany({})
  await prisma.comment.deleteMany({})
  await prisma.user.deleteMany({})

  await prisma.user.createMany({
    data: [
      {
        id: 1,
        name: 'Rob Hope',
        avatar: 'images/avatar-bob.png'
      },
      {
        name: 'Sophie Brecht',
        avatar: 'images/avatar-sophie.png'
      },
      {
        name: 'Cameron Lawrence',
        avatar: 'images/avatar-cameron.png'
      },
    ]
  })
  const users = await prisma.user.findMany({ orderBy: { id: 'asc' } })

  await prisma.comment.createMany({
    data: [
      {
        id: 1,
        body: `Jeepers now that's a huge release with some big community earnings to back it - it must be so rewarding seeing creators quit their day jobs after monetizing (with real MRR) on the new platform.`,
        upvoteCount: 0,
        userId: users[0].id,
        createdAt: subMinutes(new Date, 45)
      },
      {
        id: 2,
        body: `Switched our blog from Hubspot to Ghost a year ago -- turned out to be a great decision. Looking forward to this update....the in-platform analytics look especially delicious. :)`,
        upvoteCount: 5,
        userId: users[1].id,
        createdAt: subDays(new Date, 1)
      },
      {
        id: 3,
        body: `Love the native memberships and the zipless themes, I was just asked by a friend about options for a new site, and I think I know what I'll be recommending then...`,
        upvoteCount: 0,
        userId: users[2].id,
        createdAt: subWeeks(new Date, 3)
      }
    ]
  })
  const comments = await prisma.comment.findMany({ orderBy: { id: 'asc' } })

  await prisma.upvote.createMany({
    data: [
      {
        commentId: comments[1].id,
        userId: users[0].id,
      }
    ]
  })

})().then(console.log).catch(console.error)
