
import { PrismaClient, MuscleGroup, Difficulty, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // 1. Create Admin User
    const hashedPassword = await bcrypt.hash('password123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@zenfit.com' },
        update: {},
        create: {
            email: 'admin@zenfit.com',
            name: 'ZenFit Admin',
            password: hashedPassword,
            role: Role.ADMIN,
        },
    })
    console.log('👤 Admin created')

    // 2. Create Exercises
    const exercisesData = [
        {
            name: 'Barbell Squat',
            muscleGroup: MuscleGroup.LEGS,
            description: 'The king of leg exercises. Targets quads, glutes, and core.',
            instructions: '1. Stand with feet shoulder-width apart.\n2. Rest the bar on your upper back.\n3. Lower your hips back and down as if sitting in a chair.\n4. Keep your chest up and back straight.\n5. Drive back up to the starting position.',
            videoUrl: 'https://www.youtube.com/watch?v=ultWZbGWL5c', // Placeholder
        },
        {
            name: 'Bench Press',
            muscleGroup: MuscleGroup.CHEST,
            description: 'Compound movement for chest, shoulders, and triceps.',
            instructions: '1. Lie on the bench with eyes under the bar.\n2. Grip the bar slightly wider than shoulder-width.\n3. Lower the bar to your mid-chest.\n4. Press the bar back up until arms are extended.',
            videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
        },
        {
            name: 'Deadlift',
            muscleGroup: MuscleGroup.BACK,
            description: 'Full body compound movement emphasizing the posterior chain.',
            instructions: '1. Stand with feet hip-width apart, barbell over mid-foot.\n2. Hinge at hips to grip the bar.\n3. Keep back flat and chest up.\n4. Drive through heels to stand up straight.\n5. Lower the bar with control.',
            videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
        },
        {
            name: 'Pull Up',
            muscleGroup: MuscleGroup.BACK,
            description: 'Bodyweight exercise for back width and strength.',
            instructions: '1. Hang from the bar with hands wider than shoulders.\n2. Pull your chest up to the bar.\n3. Squeeze your back muscles at the top.\n4. Lower yourself all the way down.',
            videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
        },
        {
            name: 'Overhead Press',
            muscleGroup: MuscleGroup.SHOULDERS,
            description: 'Vertical push for shoulder mass and strength.',
            instructions: '1. Stand with bar on front shoulders.\n2. Press the bar directly overhead.\n3. Lock out arms at the top.\n4. Lower back significantly to starting position.',
            videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
        },
        {
            name: 'Dumbbell Lunge',
            muscleGroup: MuscleGroup.LEGS,
            description: 'Unilateral leg exercise for balance and development.',
            instructions: '1. Hold dumbbells at your sides.\n2. Step forward with one leg.\n3. Lower hips until both knees are bent at 90 degrees.\n4. Push back to starting position.',
            videoUrl: 'https://www.youtube.com/watch?v=D7KaRcUTQeE',
        },
        {
            name: 'Plank',
            muscleGroup: MuscleGroup.CORE,
            description: 'Isometric core stability exercise.',
            instructions: '1. Get into a pushup position but on your forearms.\n2. Keep your body in a straight line from head to heels.\n3. Hold this position, engaging your core.',
            videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
        },
        {
            name: 'HIIT Sprints',
            muscleGroup: MuscleGroup.CARDIO,
            description: 'High intensity interval running.',
            instructions: '1. Sprint at 90% effort for 30 seconds.\n2. Walk or jog for 60 seconds.\n3. Repeat for prescribed rounds.',
            videoUrl: null,
        },
    ]

    console.log('🏋️ Seeding exercises...')
    const exercises = []
    for (const ex of exercisesData) {
        const exercise = await prisma.exercise.upsert({
            where: { id: ex.name.toLowerCase().replace(/\s+/g, '-') }, // simplistic id generation for upsert stability
            update: {},
            create: {
                id: ex.name.toLowerCase().replace(/\s+/g, '-'),
                ...ex
            },
        })
        exercises.push(exercise)
    }

    // 3. Create Programs

    // Program 1: Hypertrophy Starter
    await prisma.program.create({
        data: {
            name: 'Hypertrophy Starter',
            description: 'Build muscle with this 4-week foundation program.',
            difficulty: Difficulty.BEGINNER,
            duration: 4,
            workouts: {
                create: [
                    {
                        name: 'Upper Body Power',
                        description: 'Focus on compound pushes and pulls.',
                        difficulty: Difficulty.BEGINNER,
                        authorId: admin.id,
                        isPublic: true,
                        exercises: {
                            create: [
                                { exerciseId: exercises.find(e => e.name === 'Bench Press')!.id, order: 1, sets: 3, reps: 8, restTime: 90 },
                                { exerciseId: exercises.find(e => e.name === 'Pull Up')!.id, order: 2, sets: 3, reps: 8, restTime: 90 },
                                { exerciseId: exercises.find(e => e.name === 'Overhead Press')!.id, order: 3, sets: 3, reps: 10, restTime: 60 },
                            ]
                        }
                    },
                    {
                        name: 'Lower Body Strength',
                        description: 'Leg development and core stability.',
                        difficulty: Difficulty.BEGINNER,
                        authorId: admin.id,
                        isPublic: true,
                        exercises: {
                            create: [
                                { exerciseId: exercises.find(e => e.name === 'Barbell Squat')!.id, order: 1, sets: 3, reps: 6, restTime: 120 },
                                { exerciseId: exercises.find(e => e.name === 'Deadlift')!.id, order: 2, sets: 3, reps: 5, restTime: 120 },
                                { exerciseId: exercises.find(e => e.name === 'Dumbbell Lunge')!.id, order: 3, sets: 3, reps: 10, restTime: 60 },
                            ]
                        }
                    }
                ]
            }
        }
    })

    // Program 2: 4-Week Weight Loss
    await prisma.program.create({
        data: {
            name: '4-Week Shred',
            description: 'High intensity workouts to burn fat and tone up.',
            difficulty: Difficulty.INTERMEDIATE,
            duration: 4,
            workouts: {
                create: [
                    {
                        name: 'Full Body HIIT',
                        description: 'Circuit style training for maximum calorie burn.',
                        difficulty: Difficulty.INTERMEDIATE,
                        authorId: admin.id,
                        isPublic: true,
                        exercises: {
                            create: [
                                { exerciseId: exercises.find(e => e.name === 'HIIT Sprints')!.id, order: 1, sets: 10, reps: 1, restTime: 60 },
                                { exerciseId: exercises.find(e => e.name === 'Plank')!.id, order: 2, sets: 3, reps: 1, restTime: 30 }, // 1 rep = hold
                                { exerciseId: exercises.find(e => e.name === 'Dumbbell Lunge')!.id, order: 3, sets: 3, reps: 15, restTime: 30 },
                            ]
                        }
                    }
                ]
            }
        }
    })

    console.log('✅ Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
