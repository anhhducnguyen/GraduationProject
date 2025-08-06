DROP EVENT IF EXISTS update_exam_schedule_status;
DROP EVENT IF EXISTS update_room_status;

-- Cập nhật trạng thái lịch thi
CREATE EVENT IF NOT EXISTS update_exam_schedule_status
ON SCHEDULE EVERY 1 MINUTE
DO
  UPDATE examschedules
  SET status = CASE
      WHEN start_time > NOW() THEN 'scheduled'
      WHEN start_time <= NOW() AND end_time >= NOW() THEN 'in_use'
      WHEN end_time < NOW() THEN 'completed'
      ELSE status
    END;

-- Cập nhật trạng thái phòng thi dựa theo ca thi
DELIMITER $$


DELIMITER $$

CREATE EVENT IF NOT EXISTS update_room_status
ON SCHEDULE EVERY 1 MINUTE
DO
BEGIN
    -- 1. Đặt trạng thái phòng là 'in_use' nếu có lịch thi đang diễn ra
    UPDATE examrooms r
    SET r.status = 'in_use'
    WHERE EXISTS (
        SELECT 1 FROM examschedules s
        WHERE s.room_id = r.room_id
          AND s.status = 'scheduled'
          AND s.start_time <= NOW()
          AND s.end_time >= NOW()
    );

    -- 2. Đặt trạng thái phòng là 'scheduled' nếu có lịch đã đặt nhưng chưa đến giờ, và phòng không đang 'in_use'
    UPDATE examrooms r
    SET r.status = 'scheduled'
    WHERE r.status != 'in_use'
      AND EXISTS (
        SELECT 1 FROM examschedules s
        WHERE s.room_id = r.room_id
          AND s.status = 'scheduled'
          AND s.start_time > NOW()
    );

    -- 3. Các phòng không có lịch scheduled đang diễn ra hoặc đã đặt => available
    UPDATE examrooms r
    SET r.status = 'available'
    WHERE NOT EXISTS (
        SELECT 1 FROM examschedules s
        WHERE s.room_id = r.room_id
          AND s.status = 'scheduled'
          AND (
               (s.start_time <= NOW() AND s.end_time >= NOW())
               OR s.start_time > NOW()
          )
    );
END$$

DELIMITER ;