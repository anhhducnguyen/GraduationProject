-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: exammanagement_do_an
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auth`
--

DROP TABLE IF EXISTS `auth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT 'GOOGLE_SSO',
  `username` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` bigint DEFAULT NULL,
  `role` enum('student','teacher','admin') NOT NULL DEFAULT 'student',
  `google_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_google_id_unique` (`google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21012487 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth`
--

LOCK TABLES `auth` WRITE;
/*!40000 ALTER TABLE `auth` DISABLE KEYS */;
INSERT INTO `auth` VALUES (1,'user1@example.com','GOOGLE_SSO','user1',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(2,'user2@example.com','GOOGLE_SSO','user2',NULL,NULL,'teacher',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(3,'user3@example.com','GOOGLE_SSO','user3',NULL,NULL,'admin',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(4,'user4@example.com','GOOGLE_SSO','user4',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(5,'user5@example.com','GOOGLE_SSO','user5',NULL,NULL,'teacher',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(6,'user6@example.com','GOOGLE_SSO','user6',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(7,'user7@example.com','GOOGLE_SSO','user7',NULL,NULL,'admin',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(8,'user8@example.com','GOOGLE_SSO','user8',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(9,'user9@example.com','GOOGLE_SSO','user9',NULL,NULL,'teacher',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(10,'user10@example.com','GOOGLE_SSO','user10',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(11,'user11@example.com','GOOGLE_SSO','user11',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(12,'user12@example.com','GOOGLE_SSO','user12',NULL,NULL,'admin',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(13,'user13@example.com','GOOGLE_SSO','user13',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(14,'user14@example.com','GOOGLE_SSO','user14',NULL,NULL,'teacher',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(15,'user15@example.com','GOOGLE_SSO','user15',NULL,NULL,'admin',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(16,'user16@example.com','GOOGLE_SSO','user16',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(17,'user17@example.com','GOOGLE_SSO','user17',NULL,NULL,'teacher',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(18,'user18@example.com','GOOGLE_SSO','user18',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(19,'user19@example.com','GOOGLE_SSO','user19',NULL,NULL,'admin',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(20,'user20@example.com','GOOGLE_SSO','user20',NULL,NULL,'teacher',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(21,'user21@example.com','GOOGLE_SSO','user21',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(22,'user22@example.com','GOOGLE_SSO','user22',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(23,'user23@example.com','GOOGLE_SSO','user23',NULL,NULL,'admin',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(24,'user24@example.com','GOOGLE_SSO','user24',NULL,NULL,'teacher',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(25,'user25@example.com','GOOGLE_SSO','user25',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(26,'user26@example.com','GOOGLE_SSO','user26',NULL,NULL,'admin',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(27,'user27@example.com','GOOGLE_SSO','user27',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(28,'user28@example.com','GOOGLE_SSO','user28',NULL,NULL,'teacher',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(29,'user29@example.com','GOOGLE_SSO','user29',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(30,'user30@example.com','GOOGLE_SSO','user30',NULL,NULL,'admin',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(31,'user31@example.com','GOOGLE_SSO','user31',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(32,'user32@example.com','GOOGLE_SSO','user32',NULL,NULL,'teacher',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(33,'user33@example.com','GOOGLE_SSO','user33',NULL,NULL,'admin',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(34,'user34@example.com','GOOGLE_SSO','user34',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(35,'user35@example.com','GOOGLE_SSO','user35',NULL,NULL,'teacher',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(36,'user36@example.com','GOOGLE_SSO','user36',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(37,'user37@example.com','GOOGLE_SSO','user37',NULL,NULL,'admin',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(38,'user38@example.com','GOOGLE_SSO','user38',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(39,'user39@example.com','GOOGLE_SSO','user39',NULL,NULL,'teacher',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(40,'user40@example.com','GOOGLE_SSO','user40',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(41,'user41@example.com','GOOGLE_SSO','user41',NULL,NULL,'admin',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(42,'user42@example.com','GOOGLE_SSO','user42',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(43,'user43@example.com','GOOGLE_SSO','user43',NULL,NULL,'teacher',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(44,'user44@example.com','GOOGLE_SSO','user44',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(45,'user45@example.com','GOOGLE_SSO','user45',NULL,NULL,'admin',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(46,'user46@example.com','GOOGLE_SSO','user46',NULL,NULL,'teacher',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(47,'user47@example.com','GOOGLE_SSO','user47',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(48,'user48@example.com','GOOGLE_SSO','user48',NULL,NULL,'admin',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(49,'user49@example.com','GOOGLE_SSO','user49',NULL,NULL,'student',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(50,'user50@example.com','GOOGLE_SSO','user50',NULL,NULL,'teacher',NULL,'2025-05-17 06:14:57','2025-05-17 06:14:57'),(21012477,'maingan@gmail.com','$2b$10$Sv/FJ/8ktO/PzcSxdh79COVPh49miF3zYZheClW41Fj5t1OW9Sp8O',NULL,NULL,NULL,'student',NULL,'2025-05-04 18:41:20','2025-05-04 18:41:20'),(21012478,'anhnguyen2k373@gmail.com','$2b$10$uhLqK7sL3BZaGtiZ4jbNouuOH7sDJ0imxeu.4znBc1P6evvdVdDOe','Admin',NULL,NULL,'admin',NULL,'2025-04-17 00:55:00','2025-04-17 00:55:00'),(21012479,'vana@example.com','$2b$10$EDEo2WHzjReuSeqJlFF4FedijcGU1F6kJkM9gWGmWPF6R.nQKB0HW','nguyenvana',NULL,NULL,'student',NULL,'2025-06-18 16:17:30','2025-06-18 16:17:30'),(21012480,'huyen@gmail.com','$2b$10$igPm4scP1wDhnvjh5P6due0llg9vHIL5TahV8ZMkwMwELNsYvBdAG','huyen',NULL,NULL,'admin',NULL,'2025-06-18 16:25:04','2025-06-18 16:25:04'),(21012481,'huyena@gmail.com','$2b$10$2CgQVAb3iMwo15.wSuR6puKdeknS6ciws1r5zqmtg/X0a6o0rQfDi','maingan@gmail.com',NULL,NULL,'student',NULL,'2025-06-18 16:57:37','2025-06-18 16:57:37'),(21012482,'21012479@st.phenikaa-uni.edu.vn','$2b$10$kHaeHCgd9jgy8a35jcesau/SkHiosNz/oRTvsON8QekXbtcZqSMeq','maingan@gmail.com',NULL,NULL,'student',NULL,'2025-06-21 00:28:43','2025-06-21 00:28:43'),(21012483,'21012483@st.phenikaa-uni.edu.vn','$2b$10$gSfhtTRLuCstPeApFMUvM.5rW.uwTlxRhoOuZW3h/YDt4Ub6u4IFm','huyen',NULL,NULL,'student',NULL,'2025-06-21 00:30:27','2025-06-21 00:30:27'),(21012484,'21012484@st.phenikaa-uni.edu.vn','$2b$10$/1eHbhcTYWplACr/bV62N..4cEoer1Uuth..nVV4Rku7IQrImVIyi','long',NULL,NULL,'student',NULL,'2025-06-21 00:31:08','2025-06-21 00:31:08'),(21012485,'21012485@st.phenikaa-uni.edu.vn','$2b$10$Rqt/QKLLVfkbO2BwJ6I8pOXDc9/3RaGp.z0LTHgyAveIyjp8aA4g6','maingan',NULL,NULL,'student',NULL,'2025-06-21 00:31:44','2025-06-21 00:31:44'),(21012486,'21012486@st.phenikaa-uni.edu.vn','$2b$10$5gO3T7yITWNeTkJkneH79Okfv2bPCOM40NWMGKha6ZRqZsa/NnUCS','tramy',NULL,NULL,'student',NULL,'2025-06-21 00:32:42','2025-06-21 00:32:42');
/*!40000 ALTER TABLE `auth` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_attendance`
--

DROP TABLE IF EXISTS `exam_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_attendance` (
  `attendance_id` int NOT NULL AUTO_INCREMENT,
  `schedule_id` int NOT NULL,
  `student_id` int NOT NULL,
  `is_present` tinyint(1) NOT NULL DEFAULT '0',
  `violation_id` int DEFAULT NULL,
  `reported_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attendance_id`),
  KEY `attendance_ibfk_1` (`schedule_id`),
  KEY `attendance_ibfk_3` (`reported_by`),
  KEY `attendance_ibfk_4` (`student_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `examschedules` (`schedule_id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_ibfk_4` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=389 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_attendance`
--

LOCK TABLES `exam_attendance` WRITE;
/*!40000 ALTER TABLE `exam_attendance` DISABLE KEYS */;
INSERT INTO `exam_attendance` VALUES (359,20,21012478,1,NULL,NULL,'2025-06-21 00:40:32','2025-06-21 00:40:32'),(360,20,21012483,0,NULL,NULL,'2025-06-21 00:40:32','2025-06-21 00:40:32'),(361,20,21012484,0,NULL,NULL,'2025-06-21 00:40:32','2025-06-21 00:40:32'),(362,20,21012485,0,NULL,NULL,'2025-06-21 00:40:32','2025-06-21 00:40:32'),(363,20,21012486,0,NULL,NULL,'2025-06-21 00:40:32','2025-06-21 00:40:32'),(369,55,21012478,1,NULL,NULL,'2025-06-21 01:36:32','2025-06-21 01:36:32'),(372,55,21012485,0,NULL,NULL,'2025-06-21 01:36:32','2025-06-21 01:36:32'),(373,55,21012486,0,NULL,NULL,'2025-06-21 01:36:32','2025-06-21 01:36:32'),(379,56,21012478,0,NULL,NULL,'2025-06-21 01:54:28','2025-06-21 01:54:28'),(380,56,21012483,0,NULL,NULL,'2025-06-21 01:54:28','2025-06-21 01:54:28'),(381,56,21012484,0,NULL,NULL,'2025-06-21 01:54:28','2025-06-21 01:54:28'),(382,56,21012485,0,NULL,NULL,'2025-06-21 01:54:28','2025-06-21 01:54:28'),(383,56,21012486,0,NULL,NULL,'2025-06-21 01:54:28','2025-06-21 01:54:28'),(384,49,21012478,1,NULL,NULL,'2025-06-21 03:53:23','2025-06-21 03:53:23'),(385,49,21012483,0,NULL,NULL,'2025-06-21 03:53:23','2025-06-21 03:53:23'),(386,49,21012484,0,NULL,NULL,'2025-06-21 03:53:23','2025-06-21 03:53:23'),(387,49,21012485,0,NULL,NULL,'2025-06-21 03:53:23','2025-06-21 03:53:23'),(388,49,21012486,0,NULL,NULL,'2025-06-21 03:53:23','2025-06-21 03:53:23');
/*!40000 ALTER TABLE `exam_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examrooms`
--

DROP TABLE IF EXISTS `examrooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examrooms` (
  `room_id` int NOT NULL AUTO_INCREMENT,
  `room_name` varchar(50) NOT NULL,
  `capacity` int NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` enum('schedule','cancel','complete') DEFAULT 'schedule',
  PRIMARY KEY (`room_id`),
  UNIQUE KEY `room_name` (`room_name`)
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examrooms`
--

LOCK TABLES `examrooms` WRITE;
/*!40000 ALTER TABLE `examrooms` DISABLE KEYS */;
INSERT INTO `examrooms` VALUES (1,'A2-201',70,'Phòng thi A101, tọa lạc tại tầng 1, tòa nhà A, Trường Đại học Phenikaa, nằm gần cổng chính và khu vực văn phòng khoa. Khu vực này thuận tiện cho việc di chuyển, có biển chỉ dẫn rõ ràng và lối đi rộng rãi.','cancel'),(2,'A2-202',40,'Phòng thi A101, tọa lạc tại tầng 1, tòa nhà A, Trường Đại học Phenikaa, nằm gần cổng chính và khu vực văn phòng khoa. Khu vực này thuận tiện cho việc di chuyển, có biển chỉ dẫn rõ ràng và lối đi rộng rãi.','cancel'),(3,'A2-203',50,'hòng thi A101, tọa lạc tại tầng 1, tòa nhà A, Trường Đại học Phenikaa, nằm gần cổng chính và khu vực văn phòng khoa. Khu vực này thuận tiện cho việc di chuyển, có biển chỉ dẫn rõ ràng và lối đi rộng rãi.','schedule'),(4,'A2-204',35,'Phòng thi A101, tọa lạc tại tầng 1, tòa nhà A, Trường Đại học Phenikaa, nằm gần cổng chính và khu vực văn phòng khoa. Khu vực này thuận tiện cho việc di chuyển, có biển chỉ dẫn rõ ràng và lối đi rộng rãi.','schedule'),(5,'A2-205',25,'Phòng thi A101, tọa lạc tại tầng 1, tòa nhà A, Trường Đại học Phenikaa, nằm gần cổng chính và khu vực văn phòng khoa. Khu vực này thuận tiện cho việc di chuyển, có biển chỉ dẫn rõ ràng và lối đi rộng rãi.','schedule'),(6,'A2-206',40,'Phòng thi A101, tọa lạc tại tầng 1, tòa nhà A, Trường Đại học Phenikaa, nằm gần cổng chính và khu vực văn phòng khoa. Khu vực này thuận tiện cho việc di chuyển, có biển chỉ dẫn rõ ràng và lối đi rộng rãi.','schedule'),(7,'A2-207',30,'Phòng thi A101, tọa lạc tại tầng 1, tòa nhà A, Trường Đại học Phenikaa, nằm gần cổng chính và khu vực văn phòng khoa. Khu vực này thuận tiện cho việc di chuyển, có biển chỉ dẫn rõ ràng và lối đi rộng rãi.','complete'),(8,'A2-301',45,'Phòng thi A101, tọa lạc tại tầng 1, tòa nhà A, Trường Đại học Phenikaa, nằm gần cổng chính và khu vực văn phòng khoa. Khu vực này thuận tiện cho việc di chuyển, có biển chỉ dẫn rõ ràng và lối đi rộng rãi.','schedule'),(9,'A2-302',20,'Phòng thi A101, tọa lạc tại tầng 1, tòa nhà A, Trường Đại học Phenikaa, nằm gần cổng chính và khu vực văn phòng khoa. Khu vực này thuận tiện cho việc di chuyển, có biển chỉ dẫn rõ ràng và lối đi rộng rãi.','schedule'),(10,'A2-303',50,'Phòng thi A101, tọa lạc tại tầng 1, tòa nhà A, Trường Đại học Phenikaa, nằm gần cổng chính và khu vực văn phòng khoa. Khu vực này thuận tiện cho việc di chuyển, có biển chỉ dẫn rõ ràng và lối đi rộng rãi.','schedule'),(11,'A2-304',38,'Phòng thi A101, tọa lạc tại tầng 1, tòa nhà A, Trường Đại học Phenikaa, nằm gần cổng chính và khu vực văn phòng khoa. Khu vực này thuận tiện cho việc di chuyển, có biển chỉ dẫn rõ ràng và lối đi rộng rãi.','schedule'),(13,'A2-306',32,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(14,'A2-307',42,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(15,'A2-401',28,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(16,'A2-402',36,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(17,'A2-403',34,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(18,'A2-404',26,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(19,'A2-405',48,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(20,'A2-406',29,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(21,'A2-407',33,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(22,'A2-501',39,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(24,'A2-503',43,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(26,'A2-504',31,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(27,'A2-505',37,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(28,'A2-506',46,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(29,'A2-507',30,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(30,'A2-601',50,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(31,'A2-602',35,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(32,'A2-603',25,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(33,'A2-604',40,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(34,'A2-605',30,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(35,'A2-606',45,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(36,'A2-607',20,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(37,'A6-101-102(PC)',50,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(38,'A6-103',38,'Phòng thi C301 nằm tại tầng 3, tòa nhà C. Từ cổng chính, rẽ phải vào khu giảng đường C, đi thang bộ hoặc thang máy lên tầng 3. Phòng nằm phía cuối hành lang bên trái.','schedule'),(39,'A6-104',22,NULL,'schedule'),(40,'A6-105',32,NULL,'schedule'),(41,'A6-106',42,NULL,'schedule'),(42,'A6-107',28,NULL,'schedule'),(43,'Room AQ',36,NULL,'schedule'),(44,'Room AR',34,NULL,'schedule'),(45,'Room AS',26,NULL,'schedule'),(46,'Room AT',48,NULL,'schedule'),(47,'Room AU',29,NULL,'schedule'),(48,'Room AV',33,NULL,'schedule'),(49,'Room AW',39,NULL,'schedule'),(50,'Room AX',41,NULL,'schedule'),(51,'Room AY',27,NULL,'schedule'),(52,'Room AZ',31,NULL,'schedule'),(53,'Room BA',37,NULL,'schedule'),(54,'Room BB',46,NULL,'schedule'),(55,'Room BC',30,NULL,'schedule'),(56,'Room BD',50,NULL,'schedule'),(57,'Room BE',35,NULL,'schedule'),(58,'Room BF',25,NULL,'schedule'),(59,'Room BG',40,NULL,'schedule'),(60,'Room BH',30,NULL,'schedule'),(61,'Room BI',45,NULL,'schedule'),(62,'Room BJ',20,NULL,'schedule'),(63,'Room BK',50,NULL,'schedule'),(64,'Room BL',38,NULL,'schedule'),(65,'Room BM',22,NULL,'schedule'),(66,'Room BN',32,NULL,'schedule'),(67,'Room BO',42,NULL,'schedule'),(68,'Room BP',28,NULL,'schedule'),(69,'Room BQ',36,NULL,'schedule'),(70,'Room BR',34,NULL,'schedule'),(71,'Room BS',26,NULL,'schedule'),(72,'Room BT',48,NULL,'schedule'),(73,'Room BU',29,NULL,'schedule'),(74,'Room BV',33,NULL,'schedule'),(75,'Room BW',39,NULL,'schedule'),(76,'Room BX',41,NULL,'schedule'),(77,'Room BY',27,NULL,'schedule'),(78,'Room BZ',31,NULL,'schedule'),(79,'Room CA',37,NULL,'schedule'),(80,'Room CB',46,NULL,'schedule'),(81,'Room CC',30,NULL,'schedule'),(82,'Room CD',50,NULL,'schedule'),(83,'Room CE',35,NULL,'schedule'),(84,'Room CF',25,NULL,'schedule'),(85,'Room CG',40,NULL,'schedule'),(86,'Room CH',30,NULL,'schedule'),(87,'Room CI',45,NULL,'schedule'),(88,'Room CJ',20,NULL,'schedule'),(89,'Room CK',50,NULL,'schedule'),(90,'Room CL',38,NULL,'schedule'),(91,'Room CM',22,NULL,'schedule'),(92,'Room CN',32,NULL,'schedule'),(93,'Room CO',42,NULL,'schedule'),(94,'Room CP',28,NULL,'schedule'),(95,'Room CQ',36,NULL,'schedule'),(96,'Room CR',34,NULL,'schedule'),(97,'Room CS',26,NULL,'schedule'),(98,'Room CT',48,NULL,'schedule'),(99,'Room CU',29,NULL,'schedule'),(100,'Room CV',33,NULL,'schedule'),(101,'Room CW',39,NULL,'schedule'),(102,'Room CX',41,NULL,'schedule'),(103,'Room CY',27,NULL,'schedule');
/*!40000 ALTER TABLE `examrooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examschedules`
--

DROP TABLE IF EXISTS `examschedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examschedules` (
  `schedule_id` int NOT NULL AUTO_INCREMENT,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `room_id` int NOT NULL,
  `created_by` int DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `name_schedule` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`schedule_id`),
  KEY `examschedules_ibfk_1` (`room_id`),
  KEY `examschedules_ibfk_2` (`created_by`),
  CONSTRAINT `examschedules_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `examrooms` (`room_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examschedules`
--

LOCK TABLES `examschedules` WRITE;
/*!40000 ALTER TABLE `examschedules` DISABLE KEYS */;
INSERT INTO `examschedules` VALUES (1,'2025-06-01 09:00:00','2025-06-01 11:00:00',1,NULL,'scheduled','Math Exam'),(2,'2025-06-01 13:00:00','2025-06-01 15:00:00',2,NULL,'scheduled','Physics Exam'),(3,'2025-06-02 09:00:00','2025-06-02 11:00:00',3,NULL,'scheduled','Chemistry Exam'),(4,'2025-05-01 08:00:00','2025-05-01 10:00:00',1,NULL,'scheduled','Math'),(5,'2025-05-03 13:00:00','2025-05-03 15:00:00',2,NULL,'scheduled','English'),(6,'2025-05-05 09:00:00','2025-05-05 11:00:00',3,NULL,'completed','History'),(7,'2025-05-07 14:00:00','2025-05-07 16:00:00',1,NULL,'cancelled','Biology'),(8,'2025-05-09 08:00:00','2025-05-09 10:00:00',2,NULL,'scheduled','Geography'),(9,'2025-05-11 13:00:00','2025-05-11 15:00:00',3,NULL,'completed','Chemistry'),(10,'2025-05-13 09:00:00','2025-05-13 11:00:00',1,NULL,'scheduled','Physics'),(11,'2025-05-15 14:00:00','2025-05-15 16:00:00',2,NULL,'cancelled','Art'),(12,'2025-05-17 08:00:00','2025-05-17 10:00:00',3,NULL,'completed','Music'),(13,'2025-05-19 13:00:00','2025-05-19 15:00:00',1,NULL,'scheduled','Computer Science'),(14,'2025-06-01 09:00:00','2025-06-01 11:00:00',1,NULL,'scheduled','Math'),(15,'2025-06-03 13:00:00','2025-06-03 15:00:00',2,NULL,'scheduled','English'),(16,'2025-06-05 09:00:00','2025-06-05 11:00:00',3,NULL,'completed','History'),(17,'2025-06-07 14:00:00','2025-06-07 16:00:00',1,NULL,'cancelled','Biology'),(18,'2025-06-09 08:00:00','2025-06-09 10:00:00',2,NULL,'scheduled','Geography'),(19,'2025-06-11 13:00:00','2025-06-11 15:00:00',3,NULL,'completed','Chemistry'),(20,'2025-06-13 09:00:00','2025-06-13 11:00:00',1,NULL,'scheduled','Physics'),(21,'2025-06-15 14:00:00','2025-06-15 16:00:00',2,NULL,'cancelled','Art'),(22,'2025-06-17 08:00:00','2025-06-17 10:00:00',3,NULL,'completed','Music'),(23,'2025-06-19 13:00:00','2025-06-19 15:00:00',1,NULL,'scheduled','Computer Science'),(24,'2025-05-13 08:00:00','2025-05-13 10:00:00',1,NULL,'scheduled','Math'),(25,'2025-05-13 14:00:00','2025-05-13 16:00:00',2,NULL,'scheduled','English'),(26,'2025-05-14 08:00:00','2025-05-14 10:00:00',3,NULL,'scheduled','History'),(27,'2025-05-14 14:00:00','2025-05-14 16:00:00',1,NULL,'scheduled','Biology'),(28,'2025-05-15 08:00:00','2025-05-15 10:00:00',2,NULL,'scheduled','Geography'),(29,'2025-05-15 14:00:00','2025-05-15 16:00:00',3,NULL,'scheduled','Chemistry'),(30,'2025-05-16 08:00:00','2025-05-16 10:00:00',1,NULL,'scheduled','Physics'),(32,'2025-05-17 08:00:00','2025-05-17 10:00:00',3,NULL,'scheduled','Music'),(33,'2025-05-17 14:00:00','2025-05-17 16:00:00',1,NULL,'scheduled','Computer Science'),(34,'2025-05-18 08:00:00','2025-05-18 10:00:00',2,NULL,'scheduled','Economics'),(35,'2025-05-18 14:00:00','2025-05-18 16:00:00',3,NULL,'scheduled','Philosophy'),(36,'2025-05-19 08:00:00','2025-05-19 10:00:00',1,NULL,'scheduled','Law'),(37,'2025-05-19 14:00:00','2025-05-19 16:00:00',2,NULL,'scheduled','Business'),(38,'2025-05-13 10:30:00','2025-05-13 12:30:00',3,NULL,'scheduled','AI'),(40,'2025-05-15 10:30:00','2025-05-15 12:30:00',2,NULL,'scheduled','Design'),(42,'2025-05-17 10:30:00','2025-05-17 12:30:00',1,NULL,'scheduled','Data Science'),(43,'2025-05-18 10:30:00','2025-05-18 12:30:00',2,NULL,'scheduled','Ethics'),(44,'2025-06-01 08:00:00','2025-06-01 10:00:00',1,NULL,'scheduled','Midterm Exam - Math 101'),(49,'2025-05-24 07:00:00','2025-05-24 08:00:00',4,NULL,'scheduled','Khai phá dữ liệu'),(50,'2025-06-18 08:20:00','2025-06-16 10:20:00',7,NULL,'scheduled','Lý thuyêt'),(51,'2025-06-18 07:00:00','2025-06-18 09:00:00',4,NULL,'scheduled','Lisa'),(53,'2025-06-19 13:00:00','2025-06-19 15:00:00',6,NULL,'scheduled','Math'),(55,'2025-06-20 07:00:00','2025-06-20 09:00:00',5,NULL,'scheduled','Giải tích'),(56,'2025-06-21 07:00:00','2025-06-21 09:00:00',6,NULL,'scheduled','Vật lý ');
/*!40000 ALTER TABLE `examschedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invigilator_exam_schedules`
--

DROP TABLE IF EXISTS `invigilator_exam_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invigilator_exam_schedules` (
  `schedule_id` int NOT NULL,
  `invigilator_id` int NOT NULL,
  PRIMARY KEY (`schedule_id`,`invigilator_id`),
  KEY `invigilator_id` (`invigilator_id`),
  CONSTRAINT `invigilator_exam_schedules_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `examschedules` (`schedule_id`) ON DELETE CASCADE,
  CONSTRAINT `invigilator_exam_schedules_ibfk_2` FOREIGN KEY (`invigilator_id`) REFERENCES `invigilators` (`invigilator_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invigilator_exam_schedules`
--

LOCK TABLES `invigilator_exam_schedules` WRITE;
/*!40000 ALTER TABLE `invigilator_exam_schedules` DISABLE KEYS */;
INSERT INTO `invigilator_exam_schedules` VALUES (1,3),(3,3),(2,4);
/*!40000 ALTER TABLE `invigilator_exam_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invigilators`
--

DROP TABLE IF EXISTS `invigilators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invigilators` (
  `invigilator_id` int NOT NULL AUTO_INCREMENT,
  `id` int NOT NULL,
  `staff_code` varchar(20) NOT NULL,
  PRIMARY KEY (`invigilator_id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `staff_code` (`staff_code`),
  CONSTRAINT `invigilators_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invigilators`
--

LOCK TABLES `invigilators` WRITE;
/*!40000 ALTER TABLE `invigilators` DISABLE KEYS */;
/*!40000 ALTER TABLE `invigilators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_violations`
--

DROP TABLE IF EXISTS `student_violations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_violations` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `schedule_id` int NOT NULL,
  `student_id` int NOT NULL,
  `violation_id` int NOT NULL,
  `reported_by` int DEFAULT NULL,
  `violation_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  KEY `schedule_id` (`schedule_id`),
  KEY `violation_id` (`violation_id`),
  KEY `reported_by` (`reported_by`),
  CONSTRAINT `student_violations_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `examschedules` (`schedule_id`) ON DELETE CASCADE,
  CONSTRAINT `student_violations_ibfk_3` FOREIGN KEY (`violation_id`) REFERENCES `violations` (`violation_id`) ON DELETE RESTRICT,
  CONSTRAINT `student_violations_ibfk_4` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_violations`
--

LOCK TABLES `student_violations` WRITE;
/*!40000 ALTER TABLE `student_violations` DISABLE KEYS */;
INSERT INTO `student_violations` VALUES (1,2,2,1,NULL,'2025-05-15 16:56:21'),(2,3,1,2,NULL,'2025-05-15 16:56:21');
/*!40000 ALTER TABLE `student_violations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id`) REFERENCES `auth` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Hà','Trần',30,'female','https://i.pravatar.cc/150?img=2','2025-05-17 06:16:33','2025-05-17 06:16:33'),(3,'Bình','Lê',40,'male','https://i.pravatar.cc/150?img=3','2025-05-17 06:16:33','2025-05-17 06:16:33'),(4,'Lan','Phạm',28,'female','https://i.pravatar.cc/150?img=4','2025-05-17 06:16:33','2025-05-17 06:16:33'),(6,'Minh','Đặng',29,'male','https://i.pravatar.cc/150?img=6','2025-05-17 06:16:33','2025-05-17 06:16:33'),(7,'Hương','Bùi',22,'female','https://i.pravatar.cc/150?img=7','2025-05-17 06:16:33','2025-05-17 06:16:33'),(8,'Sơn','Đỗ',35,'male','https://i.pravatar.cc/150?img=8','2025-05-17 06:16:33','2025-05-17 06:16:33'),(9,'Linh','Ngô',27,'female','https://i.pravatar.cc/150?img=9','2025-05-17 06:16:33','2025-05-17 06:16:33'),(10,'Dũng','Vũ',33,'male','https://i.pravatar.cc/150?img=10','2025-05-17 06:16:33','2025-05-17 06:16:33'),(11,'Hà','Nguyễn',26,'female','https://i.pravatar.cc/150?img=11','2025-05-17 06:16:33','2025-05-17 06:16:33'),(13,'Lan','Trần',24,'female','https://i.pravatar.cc/150?img=13','2025-05-17 06:16:33','2025-05-17 06:16:33'),(14,'Minh','Hoàng',36,'male','https://i.pravatar.cc/150?img=14','2025-05-17 06:16:33','2025-05-17 06:16:33'),(15,'An','Đặng',23,'male','https://i.pravatar.cc/150?img=15','2025-05-17 06:16:33','2025-05-17 06:16:33'),(16,'Hương','Bùi',34,'female','https://i.pravatar.cc/150?img=16','2025-05-17 06:16:33','2025-05-17 06:16:33'),(17,'Dũng','Đỗ',29,'male','https://i.pravatar.cc/150?img=17','2025-05-17 06:16:33','2025-05-17 06:16:33'),(18,'Sơn','Ngô',38,'male','https://i.pravatar.cc/150?img=18','2025-05-17 06:16:33','2025-05-17 06:16:33'),(19,'Linh','Vũ',21,'female','https://i.pravatar.cc/150?img=19','2025-05-17 06:16:33','2025-05-17 06:16:33'),(20,'Bình','Lê',45,'male','https://i.pravatar.cc/150?img=20','2025-05-17 06:16:33','2025-05-17 06:16:33'),(21,'An','Trần',28,'male','https://i.pravatar.cc/150?img=21','2025-05-17 06:16:33','2025-05-17 06:16:33'),(22,'Lan','Nguyễn',26,'female','https://i.pravatar.cc/150?img=22','2025-05-17 06:16:33','2025-05-17 06:16:33'),(23,'Minh','Phạm',34,'male','https://i.pravatar.cc/150?img=23','2025-05-17 06:16:33','2025-05-17 06:16:33'),(24,'Hà','Hoàng',25,'female','https://i.pravatar.cc/150?img=24','2025-05-17 06:16:33','2025-05-17 06:16:33'),(25,'Tú','Đặng',32,'male','https://i.pravatar.cc/150?img=25','2025-05-17 06:16:33','2025-05-17 06:16:33'),(26,'Hương','Bùi',29,'female','https://i.pravatar.cc/150?img=26','2025-05-17 06:16:33','2025-05-17 06:16:33'),(27,'Dũng','Đỗ',31,'male','https://i.pravatar.cc/150?img=27','2025-05-17 06:16:33','2025-05-17 06:16:33'),(28,'Linh','Ngô',23,'female','https://i.pravatar.cc/150?img=28','2025-05-17 06:16:33','2025-05-17 06:16:33'),(29,'Sơn','Vũ',37,'male','https://i.pravatar.cc/150?img=29','2025-05-17 06:16:33','2025-05-17 06:16:33'),(30,'Bình','Nguyễn',44,'male','https://i.pravatar.cc/150?img=30','2025-05-17 06:16:33','2025-05-17 06:16:33'),(31,'Hà','Trần',28,'female','https://i.pravatar.cc/150?img=31','2025-05-17 06:16:33','2025-05-17 06:16:33'),(32,'An','Phạm',33,'male','https://i.pravatar.cc/150?img=32','2025-05-17 06:16:33','2025-05-17 06:16:33'),(33,'Lan','Hoàng',30,'female','https://i.pravatar.cc/150?img=33','2025-05-17 06:16:33','2025-05-17 06:16:33'),(34,'Minh','Đặng',35,'male','https://i.pravatar.cc/150?img=34','2025-05-17 06:16:33','2025-05-17 06:16:33'),(35,'Linh','Bùi',24,'female','https://i.pravatar.cc/150?img=35','2025-05-17 06:16:33','2025-05-17 06:16:33'),(36,'Tú','Đỗ',39,'male','https://i.pravatar.cc/150?img=36','2025-05-17 06:16:33','2025-05-17 06:16:33'),(37,'Sơn','Ngô',42,'male','https://i.pravatar.cc/150?img=37','2025-05-17 06:16:33','2025-05-17 06:16:33'),(38,'Hương','Vũ',22,'female','https://i.pravatar.cc/150?img=38','2025-05-17 06:16:33','2025-05-17 06:16:33'),(39,'Dũng','Lê',41,'male','https://i.pravatar.cc/150?img=39','2025-05-17 06:16:33','2025-05-17 06:16:33'),(40,'An','Trần',29,'male','https://i.pravatar.cc/150?img=40','2025-05-17 06:16:33','2025-05-17 06:16:33'),(41,'Lan','Nguyễn',26,'female','https://i.pravatar.cc/150?img=41','2025-05-17 06:16:33','2025-05-17 06:16:33'),(42,'Minh','Phạm',33,'male','https://i.pravatar.cc/150?img=42','2025-05-17 06:16:33','2025-05-17 06:16:33'),(43,'Hà','Hoàng',27,'female','https://i.pravatar.cc/150?img=43','2025-05-17 06:16:33','2025-05-17 06:16:33'),(44,'Tú','Đặng',30,'male','https://i.pravatar.cc/150?img=44','2025-05-17 06:16:33','2025-05-17 06:16:33'),(45,'Hương','Bùi',31,'female','https://i.pravatar.cc/150?img=45','2025-05-17 06:16:33','2025-05-17 06:16:33'),(46,'Dũng','Đỗ',36,'male','https://i.pravatar.cc/150?img=46','2025-05-17 06:16:33','2025-05-17 06:16:33'),(47,'Linh','Ngô',24,'female','https://i.pravatar.cc/150?img=47','2025-05-17 06:16:33','2025-05-17 06:16:33'),(48,'Sơn','Vũ',34,'male','https://i.pravatar.cc/150?img=48','2025-05-17 06:16:33','2025-05-17 06:16:33'),(49,'Bình','Nguyễn',38,'male','https://i.pravatar.cc/150?img=49','2025-05-17 06:16:33','2025-05-17 06:16:33'),(50,'Tú','Ngô',34,'female','https://i.pravatar.cc/150?img=50','2025-05-17 06:16:33','2025-05-17 06:16:33'),(21012478,'Anh','Nguyen Duc',30,NULL,'https://i.pravatar.cc/150?img=50','2025-05-20 03:14:15','2025-05-20 03:14:15'),(21012483,'Huyen','Hoang Thi Ngoc ',18,'male',NULL,'2025-06-21 00:30:27','2025-06-21 00:30:27'),(21012484,'Long','Nguyen Van',18,'male',NULL,'2025-06-21 00:31:08','2025-06-21 00:31:08'),(21012485,'Ngan','Nguyen Thi Mai Ngan',18,'male',NULL,'2025-06-21 00:31:44','2025-06-21 00:31:44'),(21012486,'My','Le Tra',18,'male',NULL,'2025-06-21 00:32:42','2025-06-21 00:32:42');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `violations`
--

DROP TABLE IF EXISTS `violations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `violations` (
  `violation_id` int NOT NULL AUTO_INCREMENT,
  `violation_name` varchar(100) NOT NULL,
  PRIMARY KEY (`violation_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `violations`
--

LOCK TABLES `violations` WRITE;
/*!40000 ALTER TABLE `violations` DISABLE KEYS */;
INSERT INTO `violations` VALUES (1,'Cheating'),(2,'Using phone'),(3,'Talking to another student'),(4,'Unauthorized materials');
/*!40000 ALTER TABLE `violations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-22  9:50:04
