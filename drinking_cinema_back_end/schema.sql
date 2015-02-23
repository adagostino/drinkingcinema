SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

-- --------------------------------------------------------

--
-- Create the database
--

CREATE DATABASE IF NOT EXISTS `drinkingcinema`;

-- --------------------------------------------------------

--
-- Table structure for table `ci_sessions`
--

CREATE  TABLE IF NOT EXISTS `drinkingcinema`.`ci_sessions` (
  `session_id` VARCHAR(40) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NOT NULL DEFAULT '0' ,
  `ip_address` VARCHAR(16) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NOT NULL DEFAULT '0' ,
  `user_agent` VARCHAR(150) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NOT NULL ,
  `last_activity` INT(10) UNSIGNED NOT NULL DEFAULT '0' ,
  `user_data` TEXT CHARACTER SET 'utf8' COLLATE 'utf8_bin' NULL DEFAULT NULL ,
  PRIMARY KEY (`session_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8 COLLATE = utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE  TABLE IF NOT EXISTS `drinkingcinema`.`login_attempts` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `ip_address` VARCHAR(40) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NOT NULL ,
  `login` VARCHAR(50) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NOT NULL ,
  `time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8 COLLATE = utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `user_autologin`
--

CREATE  TABLE IF NOT EXISTS `drinkingcinema`.`user_autologin` (
  `key_id` CHAR(32) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NOT NULL ,
  `user_id` INT(11) NOT NULL DEFAULT '0' ,
  `user_agent` VARCHAR(150) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NOT NULL ,
  `last_ip` VARCHAR(40) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NOT NULL ,
  `last_login` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  PRIMARY KEY (`key_id`, `user_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8 COLLATE = utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE  TABLE IF NOT EXISTS `drinkingcinema`.`user_profiles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `user_id` INT(11) NOT NULL ,
  `country` VARCHAR(20) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NULL DEFAULT NULL ,
  `website` VARCHAR(255) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NULL DEFAULT NULL ,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8 COLLATE = utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE  TABLE IF NOT EXISTS `drinkingcinema`.`users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `username` VARCHAR(50) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NOT NULL ,
  `password` VARCHAR(255) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NOT NULL ,
  `email` VARCHAR(100) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NOT NULL ,
  `activated` TINYINT(1) NOT NULL DEFAULT '1' ,
  `banned` TINYINT(1) NOT NULL DEFAULT '0' ,
  `ban_reason` VARCHAR(255) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NULL DEFAULT NULL ,
  `new_password_key` VARCHAR(50) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NULL DEFAULT NULL ,
  `new_password_requested` DATETIME NULL DEFAULT NULL ,
  `new_email` VARCHAR(100) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NULL DEFAULT NULL ,
  `new_email_key` VARCHAR(50) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NULL DEFAULT NULL ,
  `last_ip` VARCHAR(40) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NOT NULL ,
  `last_login` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00' ,
  `created` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00' ,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  `is_admin` TINYINT(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8 COLLATE = utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `movieTable`
--

CREATE  TABLE IF NOT EXISTS `drinkingcinema`.`movieTable` (
  `p_Id` INT(11) NOT NULL AUTO_INCREMENT ,
  `movieName` VARCHAR(333) NULL DEFAULT NULL ,
  `movieNameUrl` VARCHAR(333) NULL DEFAULT NULL ,
  `tags` VARCHAR(333) NULL DEFAULT NULL ,
  `rulesHTML` VARCHAR(12288) NULL DEFAULT NULL ,
  `optionalRulesHTML` VARCHAR(4096) NULL DEFAULT NULL ,
  `uploadDate` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ,
  `uploadUser` VARCHAR(512) NULL DEFAULT NULL ,
  `editDate` TIMESTAMP NULL DEFAULT NULL ,
  `editUser` VARCHAR(512) NULL DEFAULT NULL ,
  `removed` TINYINT(1) NOT NULL DEFAULT '0',
  `removeDate` TIMESTAMP NULL DEFAULT NULL ,
  `removeUser` VARCHAR(512) NULL DEFAULT NULL ,
  PRIMARY KEY (`p_Id`) ,
  UNIQUE INDEX `idmovieTable_UNIQUE` (`p_Id` ASC) ,
  INDEX `movieNameUrl` (`movieNameUrl` ASC) ,
  INDEX `uploadDate` (`uploadDate` ASC) ,
  FULLTEXT INDEX `rulesHTML` (`rulesHTML` ASC) ,
  FULLTEXT INDEX `optionalRulesHTML` (`optionalRulesHTML` ASC) ,
  FULLTEXT INDEX `all` (`movieName` ASC, `tags` ASC, `rulesHTML` ASC, `optionalRulesHTML` ASC) ,
  FULLTEXT INDEX `movieName` (`movieName` ASC) ,
  FULLTEXT INDEX `tags` (`tags` ASC)
) ENGINE = MyISAM DEFAULT CHARACTER SET = utf8;

-- --------------------------------------------------------

--
-- Table structure for table `commentsTable`
--

CREATE  TABLE IF NOT EXISTS `drinkingcinema`.`commentsTable` (
  `p_Id` INT(11) NOT NULL AUTO_INCREMENT ,
  `subjectId` VARCHAR(333) NOT NULL ,
  `path` VARCHAR(333) NOT NULL ,
  `uploadDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  `movieNameUrl` VARCHAR(333) NULL DEFAULT NULL ,
  `userName` VARCHAR(512) NOT NULL ,
  `userEmail` VARCHAR(512) NOT NULL ,
  `userWebsite` VARCHAR(512) NULL DEFAULT NULL ,
  `userSubject` VARCHAR(512) NULL DEFAULT NULL ,
  `userComment` VARCHAR(2048) NOT NULL ,
  `flagged` INT(11) NULL DEFAULT '0' ,
  `flaggedDate` TIMESTAMP NULL DEFAULT NULL ,
  `editDate` TIMESTAMP NULL DEFAULT NULL ,
  `editUser` VARCHAR(512) NULL DEFAULT NULL ,
  `removed` TINYINT(1) NULL DEFAULT '0' ,
  `removeDate` TIMESTAMP NULL DEFAULT NULL ,
  `removeUser` VARCHAR(512) NULL DEFAULT NULL ,
  `notified` INT(11) NULL DEFAULT NULL ,
  PRIMARY KEY (`p_Id`) ,
  INDEX `subjectId` (`subjectId` ASC) ,
  INDEX `movieNameUrl` (`movieNameUrl` ASC) ,
  INDEX `flagged` (`flagged` ASC) ,
  INDEX `uploadDate` (`uploadDate` ASC) ,
  INDEX `removed` (`removed` ASC) ,
  INDEX `flaggedDate` (`flaggedDate` ASC) ,
  INDEX `removeDate` (`removeDate` ASC) ,
  INDEX `notified` (`notified` ASC)
) ENGINE = MyISAM DEFAULT CHARACTER SET = utf8;

-- --------------------------------------------------------

--
-- Table structure for table `emailsTable`
--

CREATE  TABLE IF NOT EXISTS `drinkingcinema`.`emailsTable` (
  `p_Id` INT(11) NOT NULL AUTO_INCREMENT ,
  `email_type` VARCHAR(333) NOT NULL ,
  `email_from` VARCHAR(333) NOT NULL ,
  `email_to` VARCHAR(333) NOT NULL ,
  `email_subject` VARCHAR(512) NULL DEFAULT NULL ,
  `email_body` VARCHAR(2048) NOT NULL ,
  `email_added_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  `email_sent` TINYINT(1) NOT NULL DEFAULT '0',
  `email_sent_date` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`p_Id`) ,
  INDEX `email_type` (`email_type` ASC) ,
  INDEX `email_from` (`email_from` ASC) ,
  INDEX `email_to` (`email_to` ASC) ,
  INDEX `email_added_date` (`email_added_date` ASC) ,
  INDEX `email_sent` (`email_sent` ASC) ,
  INDEX `email_sent_date` (`email_sent_date` ASC)
) ENGINE = MyISAM DEFAULT CHARACTER SET = utf8;