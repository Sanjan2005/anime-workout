import { MuscleGroup, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ExerciseSeed = {
  slug: string;
  name: string;
  muscleGroup: MuscleGroup;
  variations: { name: string; tier: number; multiplier: number }[];
};

const EXERCISES: ExerciseSeed[] = [
  {
    slug: "push_up",
    name: "Push-Up",
    muscleGroup: MuscleGroup.CHEST,
    variations: [
      { name: "Wall Push-Up", tier: 1, multiplier: 0.6 },
      { name: "Incline Push-Up", tier: 2, multiplier: 0.8 },
      { name: "Standard Push-Up", tier: 3, multiplier: 1.0 },
      { name: "Decline Push-Up", tier: 4, multiplier: 1.25 },
      { name: "Diamond Push-Up", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "pull_up",
    name: "Pull-Up",
    muscleGroup: MuscleGroup.BACK,
    variations: [
      { name: "Scapular Pull", tier: 1, multiplier: 0.6 },
      { name: "Assisted Pull-Up", tier: 2, multiplier: 0.8 },
      { name: "Standard Pull-Up", tier: 3, multiplier: 1.0 },
      { name: "Wide Grip Pull-Up", tier: 4, multiplier: 1.25 },
      { name: "Archer Pull-Up", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "row",
    name: "Row",
    muscleGroup: MuscleGroup.BACK,
    variations: [
      { name: "Incline Row (Table)", tier: 1, multiplier: 0.6 },
      { name: "Band Row", tier: 2, multiplier: 0.8 },
      { name: "Inverted Row", tier: 3, multiplier: 1.0 },
      { name: "Feet-Elevated Row", tier: 4, multiplier: 1.25 },
      { name: "One-Arm Row", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "squat",
    name: "Squat",
    muscleGroup: MuscleGroup.LEGS,
    variations: [
      { name: "Chair Squat", tier: 1, multiplier: 0.6 },
      { name: "Box Squat", tier: 2, multiplier: 0.8 },
      { name: "Bodyweight Squat", tier: 3, multiplier: 1.0 },
      { name: "Bulgarian Split Squat", tier: 4, multiplier: 1.25 },
      { name: "Pistol Squat Progression", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "lunge",
    name: "Lunge",
    muscleGroup: MuscleGroup.LEGS,
    variations: [
      { name: "Static Lunge", tier: 1, multiplier: 0.6 },
      { name: "Reverse Lunge", tier: 2, multiplier: 0.8 },
      { name: "Walking Lunge", tier: 3, multiplier: 1.0 },
      { name: "Jump Lunge", tier: 4, multiplier: 1.25 },
      { name: "Weighted Lunge", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "dip",
    name: "Dip",
    muscleGroup: MuscleGroup.ARMS,
    variations: [
      { name: "Bench Dip (Bent Knees)", tier: 1, multiplier: 0.6 },
      { name: "Bench Dip", tier: 2, multiplier: 0.8 },
      { name: "Parallel Bar Dip", tier: 3, multiplier: 1.0 },
      { name: "Ring Dip", tier: 4, multiplier: 1.25 },
      { name: "Weighted Dip", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "plank",
    name: "Plank",
    muscleGroup: MuscleGroup.CORE,
    variations: [
      { name: "Knee Plank", tier: 1, multiplier: 0.6 },
      { name: "Plank (30s hold)", tier: 2, multiplier: 0.8 },
      { name: "Standard Plank", tier: 3, multiplier: 1.0 },
      { name: "Plank Shoulder Tap", tier: 4, multiplier: 1.25 },
      { name: "Plank to Push-Up", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "crunch",
    name: "Crunch",
    muscleGroup: MuscleGroup.CORE,
    variations: [
      { name: "Dead Bug", tier: 1, multiplier: 0.6 },
      { name: "Bicycle Crunch", tier: 2, multiplier: 0.8 },
      { name: "Standard Crunch", tier: 3, multiplier: 1.0 },
      { name: "V-Up", tier: 4, multiplier: 1.25 },
      { name: "Hanging Knee Raise", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "shoulder_press",
    name: "Pike Push-Up",
    muscleGroup: MuscleGroup.SHOULDERS,
    variations: [
      { name: "Incline Pike", tier: 1, multiplier: 0.6 },
      { name: "Pike Push-Up", tier: 2, multiplier: 0.8 },
      { name: "Elevated Pike Push-Up", tier: 3, multiplier: 1.0 },
      { name: "Wall Handstand Hold", tier: 4, multiplier: 1.25 },
      { name: "Handstand Push-Up Progression", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "lateral_raise",
    name: "Lateral Raise",
    muscleGroup: MuscleGroup.SHOULDERS,
    variations: [
      { name: "Arm Circles", tier: 1, multiplier: 0.6 },
      { name: "Band Lateral Raise", tier: 2, multiplier: 0.8 },
      { name: "Bodyweight Lateral Raise", tier: 3, multiplier: 1.0 },
      { name: "Slow Tempo Raise", tier: 4, multiplier: 1.25 },
      { name: "Water Bottle Raise", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "glute_bridge",
    name: "Glute Bridge",
    muscleGroup: MuscleGroup.LEGS,
    variations: [
      { name: "Pelvic Tilt", tier: 1, multiplier: 0.6 },
      { name: "Glute Bridge Hold", tier: 2, multiplier: 0.8 },
      { name: "Standard Glute Bridge", tier: 3, multiplier: 1.0 },
      { name: "Single-Leg Bridge", tier: 4, multiplier: 1.25 },
      { name: "Elevated Bridge", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "calf_raise",
    name: "Calf Raise",
    muscleGroup: MuscleGroup.LEGS,
    variations: [
      { name: "Seated Calf Raise", tier: 1, multiplier: 0.6 },
      { name: "Standing Calf Raise", tier: 2, multiplier: 0.8 },
      { name: "Single-Leg Calf Raise", tier: 3, multiplier: 1.0 },
      { name: "Elevated Calf Raise", tier: 4, multiplier: 1.25 },
      { name: "Jump Rope Simulation", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "burpee",
    name: "Burpee",
    muscleGroup: MuscleGroup.FULL_BODY,
    variations: [
      { name: "Step-Back Burpee", tier: 1, multiplier: 0.6 },
      { name: "Half Burpee", tier: 2, multiplier: 0.8 },
      { name: "Standard Burpee", tier: 3, multiplier: 1.0 },
      { name: "Burpee with Push-Up", tier: 4, multiplier: 1.25 },
      { name: "Burpee with Tuck Jump", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "mountain_climber",
    name: "Mountain Climber",
    muscleGroup: MuscleGroup.FULL_BODY,
    variations: [
      { name: "Slow Mountain Climber", tier: 1, multiplier: 0.6 },
      { name: "Incline Mountain Climber", tier: 2, multiplier: 0.8 },
      { name: "Standard Mountain Climber", tier: 3, multiplier: 1.0 },
      { name: "Cross-Body Climber", tier: 4, multiplier: 1.25 },
      { name: "Spiderman Climber", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "superman",
    name: "Superman Hold",
    muscleGroup: MuscleGroup.BACK,
    variations: [
      { name: "Prone Y Raise", tier: 1, multiplier: 0.6 },
      { name: "Superman Hold (10s)", tier: 2, multiplier: 0.8 },
      { name: "Superman Hold", tier: 3, multiplier: 1.0 },
      { name: "Superman Pulse", tier: 4, multiplier: 1.25 },
      { name: "Superman with Arm/Leg Lift", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "tricep_extension",
    name: "Tricep Extension",
    muscleGroup: MuscleGroup.ARMS,
    variations: [
      { name: "Wall Push Tricep", tier: 1, multiplier: 0.6 },
      { name: "Band Tricep Extension", tier: 2, multiplier: 0.8 },
      { name: "Bodyweight Tricep Extension", tier: 3, multiplier: 1.0 },
      { name: "Elevated Tricep Extension", tier: 4, multiplier: 1.25 },
      { name: "Ring Tricep Extension", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "bicep_curl",
    name: "Bicep Curl",
    muscleGroup: MuscleGroup.ARMS,
    variations: [
      { name: "Isometric Curl Hold", tier: 1, multiplier: 0.6 },
      { name: "Band Curl", tier: 2, multiplier: 0.8 },
      { name: "Water Bottle Curl", tier: 3, multiplier: 1.0 },
      { name: "Slow Tempo Curl", tier: 4, multiplier: 1.25 },
      { name: "Chin-Up Hold", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "leg_raise",
    name: "Leg Raise",
    muscleGroup: MuscleGroup.CORE,
    variations: [
      { name: "Knee Raise", tier: 1, multiplier: 0.6 },
      { name: "Lying Leg Raise", tier: 2, multiplier: 0.8 },
      { name: "Standard Leg Raise", tier: 3, multiplier: 1.0 },
      { name: "Hanging Leg Raise", tier: 4, multiplier: 1.25 },
      { name: "Toes to Bar Progression", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "hip_hinge",
    name: "Good Morning",
    muscleGroup: MuscleGroup.LEGS,
    variations: [
      { name: "Cat-Cow", tier: 1, multiplier: 0.6 },
      { name: "Bodyweight Good Morning", tier: 2, multiplier: 0.8 },
      { name: "Standard Good Morning", tier: 3, multiplier: 1.0 },
      { name: "Single-Leg RDL", tier: 4, multiplier: 1.25 },
      { name: "Weighted RDL", tier: 5, multiplier: 1.5 },
    ],
  },
  {
    slug: "jump_squat",
    name: "Jump Squat",
    muscleGroup: MuscleGroup.LEGS,
    variations: [
      { name: "Squat to Calf Raise", tier: 1, multiplier: 0.6 },
      { name: "Quarter Squat Jump", tier: 2, multiplier: 0.8 },
      { name: "Jump Squat", tier: 3, multiplier: 1.0 },
      { name: "Broad Jump", tier: 4, multiplier: 1.25 },
      { name: "Tuck Jump", tier: 5, multiplier: 1.5 },
    ],
  },
];

async function main() {
  for (const exercise of EXERCISES) {
    await prisma.exercise.upsert({
      where: { slug: exercise.slug },
      create: {
        slug: exercise.slug,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        variations: {
          create: exercise.variations.map((v) => ({
            name: v.name,
            difficultyTier: v.tier,
            difficultyMultiplier: v.multiplier,
          })),
        },
      },
      update: {
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
      },
    });
  }

  console.log(`Seeded ${EXERCISES.length} exercises`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
