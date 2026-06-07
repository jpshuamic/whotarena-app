-- Default platform settings (Section 8)

INSERT INTO platform_settings (key, value) VALUES
  ('rake_percentage', '10'),
  ('min_deposit', '200000'),
  ('min_withdrawal', '100000'),
  ('max_daily_withdrawal', '5000000'),
  ('maintenance_mode', 'false'),
  ('bot_daily_loss_limit', '5000000'),
  ('bot_fill_percentage', '30'),
  ('bot_response_min_ms', '1200'),
  ('bot_response_max_ms', '3800'),
  ('emergency_bot_stop', 'false'),
  ('reconnect_window_ms', '30000'),
  ('house_bank_kobo', '20000000')
ON CONFLICT (key) DO NOTHING;
