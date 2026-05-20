import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isProfileComplete(user: {
  fullName: string | null;
  age: number | null;
  track: string | null;
  classLevel: number | null;
  schoolName: string | null;
  phone: string | null;
}): boolean {
  const base = Boolean(
    user.fullName?.trim() &&
      user.age != null &&
      user.age >= 10 &&
      user.track &&
      user.schoolName?.trim() &&
      user.phone?.trim(),
  );
  if (!base) return false;
  if (user.track === "class_9_12") {
    return user.classLevel != null && user.classLevel >= 9 && user.classLevel <= 12;
  }
  return true;
}
