import { expect, describe, it, beforeEach, vi, afterEach } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { ChekInUseCase } from './check-in'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Decimal } from '@prisma/client/runtime/library'
import { MaxDistanceError } from './errors/max-distance-error'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins-error'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: ChekInUseCase

describe('Check-In Use Case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new ChekInUseCase(checkInsRepository, gymsRepository)

    await gymsRepository.create({
      id: 'gym-id',
      title: 'JavaScript Gym',
      description: 'The best gym to learn JavaScript',
      phone: '123456789',
      latitude: -22.9741712,
      longitude: -46.5391409,
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    const { checkIn } = await sut.execute({
      userId: 'user-id',
      gymId: 'gym-id',
      userLatitude: -22.9741712,
      userLongitude: -46.5391409,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    await sut.execute({
      userId: 'user-id',
      gymId: 'gym-id',
      userLatitude: -22.9741712,
      userLongitude: -46.5391409,
    })

    expect(() =>
      sut.execute({
        userId: 'user-id',
        gymId: 'gym-id',
        userLatitude: -22.9741712,
        userLongitude: -46.5391409,
      }),
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
  })

  it('should be able to check in twice but in different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    await sut.execute({
      userId: 'user-id',
      gymId: 'gym-id',
      userLatitude: -22.9741712,
      userLongitude: -46.5391409,
    })

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0))

    const { checkIn } = await sut.execute({
      userId: 'user-id',
      gymId: 'gym-id',
      userLatitude: -22.9741712,
      userLongitude: -46.5391409,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in on distant gym', async () => {
    gymsRepository.items.push({
      id: 'gym-id-02',
      title: 'JavaScript Gym',
      description: 'The best gym to learn JavaScript',
      phone: '123456789',
      latitude: new Decimal(-23.0188312),
      longitude: new Decimal(-46.4370333),
    })

    expect(() =>
      sut.execute({
        userId: 'user-id',
        gymId: 'gym-id-02',
        userLatitude: -22.9741712,
        userLongitude: -46.5391409,
      }),
    ).rejects.toBeInstanceOf(MaxDistanceError)
  })
})
