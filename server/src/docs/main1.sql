-- MySQL Script: Đã chỉnh sửa và kiểm tra

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

DROP SCHEMA IF EXISTS `exammanagement_do_an`;
CREATE SCHEMA IF NOT EXISTS `exammanagement_do_an` DEFAULT CHARACTER SET utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
USE `exammanagement_do_an`;

-- examrooms
DROP TABLE IF EXISTS `examrooms`;
CREATE TABLE `examrooms` (
  `room_id` INT NOT NULL AUTO_INCREMENT,
  `room_name` VARCHAR(50) NOT NULL,
  `capacity` INT NOT NULL,
  PRIMARY KEY (`room_id`),
  UNIQUE INDEX `room_name` (`room_name`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- auth
DROP TABLE IF EXISTS `auth`;
CREATE TABLE `auth` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT 'GOOGLE_SSO',
  `username` VARCHAR(255) DEFAULT NULL,
  `reset_token` VARCHAR(255) DEFAULT NULL,
  `reset_token_expiry` BIGINT DEFAULT NULL,
  `role` ENUM('student','teacher','admin') NOT NULL DEFAULT 'student',
  `google_id` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_google_id_unique` (`google_id`)
);

-- users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT NOT NULL,
  `first_name` VARCHAR(255) DEFAULT NULL,
  `last_name` VARCHAR(255) DEFAULT NULL,
  `age` INT DEFAULT NULL,
  `gender` VARCHAR(255) DEFAULT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id`) REFERENCES `auth`(`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- examschedules
DROP TABLE IF EXISTS `examschedules`;
CREATE TABLE `examschedules` (
  `schedule_id` INT NOT NULL AUTO_INCREMENT,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `room_id` INT NOT NULL,
  `created_by` INT DEFAULT NULL,
  `status` ENUM('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `name_schedule` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`schedule_id`),
  CONSTRAINT `examschedules_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `examrooms` (`room_id`) ON DELETE RESTRICT,
  CONSTRAINT `examschedules_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- attendance
DROP TABLE IF EXISTS `exam_attendance`;
CREATE TABLE `exam_attendance` (
  `attendance_id` INT NOT NULL AUTO_INCREMENT,
  `schedule_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `is_present` TINYINT(1) NOT NULL DEFAULT '0',
  `violation_id` INT DEFAULT NULL,
  `reported_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attendance_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `examschedules` (`schedule_id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_ibfk_3` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- invigilators
DROP TABLE IF EXISTS `invigilators`;
CREATE TABLE `invigilators` (
  `invigilator_id` INT NOT NULL AUTO_INCREMENT,
  `id` INT NOT NULL,
  `staff_code` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`invigilator_id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `staff_code` (`staff_code`),
  CONSTRAINT `invigilators_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- invigilator_exam_schedules
DROP TABLE IF EXISTS `invigilator_exam_schedules`;
CREATE TABLE `invigilator_exam_schedules` (
  `schedule_id` INT NOT NULL,
  `invigilator_id` INT NOT NULL,
  PRIMARY KEY (`schedule_id`, `invigilator_id`),
  INDEX `invigilator_id` (`invigilator_id`),
  CONSTRAINT `invigilator_exam_schedules_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `examschedules` (`schedule_id`) ON DELETE CASCADE,
  CONSTRAINT `invigilator_exam_schedules_ibfk_2` FOREIGN KEY (`invigilator_id`) REFERENCES `invigilators` (`invigilator_id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- violations
DROP TABLE IF EXISTS `violations`;
CREATE TABLE `violations` (
  `violation_id` INT NOT NULL AUTO_INCREMENT,
  `violation_name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`violation_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- student_violations
DROP TABLE IF EXISTS `student_violations`;
CREATE TABLE `student_violations` (
  `report_id` INT NOT NULL AUTO_INCREMENT,
  `schedule_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `violation_id` INT NOT NULL,
  `reported_by` INT DEFAULT NULL,
  `violation_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  INDEX `schedule_id` (`schedule_id`),
  INDEX `violation_id` (`violation_id`),
  INDEX `reported_by` (`reported_by`),
  CONSTRAINT `student_violations_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `examschedules` (`schedule_id`) ON DELETE CASCADE,
  CONSTRAINT `student_violations_ibfk_3` FOREIGN KEY (`violation_id`) REFERENCES `violations` (`violation_id`) ON DELETE RESTRICT,
  CONSTRAINT `student_violations_ibfk_4` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Restore session settings
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
