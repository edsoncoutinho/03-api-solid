import { type FastifyRequest, type FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeValidateCheckInUseCase } from '@/use-cases/factories/make-validate-check-in-use-case'

export async function validate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const validateCheckInParamsScherma = z.object({
    checkInId: z.string().uuid(),
  })

  const { checkInId } = validateCheckInParamsScherma.parse(request.params)

  const validateCheckInUseCase = makeValidateCheckInUseCase()

  await validateCheckInUseCase.execute({
    checkInId,
  })

  return await reply.status(204).send()
}
