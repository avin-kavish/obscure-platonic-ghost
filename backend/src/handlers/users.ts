import { Type as T } from '@sinclair/typebox'
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { coerceArray } from "../lib/util"
import { prisma } from "../prisma/client"

export function configureUsers({ app }: { app: FastifyInstance }) {

  app.get('/api/v1/users', {
    schema: {
      querystring: T.Object({
        ids: T.Optional(T.Union([ T.Array(T.Number()), T.Number() ]))
      })
    }
  }, getUsers)
}

type GetUsersRequest = FastifyRequest<{ Querystring: { ids: number[] } }>

export async function getUsers(request: GetUsersRequest, reply: FastifyReply) {
  const { ids = [] } = request.query

  return {
    data: await (
      ids.length > 0
        ? prisma.user.findMany({ where: { id: { in: coerceArray(ids) } } })
        : prisma.user.findMany()
    )
  }
}
