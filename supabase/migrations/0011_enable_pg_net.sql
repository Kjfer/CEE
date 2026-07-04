-- El cron check-enrollment-daily (0006_setup_cron_check_enrollment.sql) llama
-- a net.http_post(), pero la extensión pg_net nunca se había habilitado en
-- este proyecto -- confirmado por cron.job_run_details: las 7 ejecuciones
-- diarias desde el 2026-06-28 fallaron con `schema "net" does not exist`,
-- es decir, la Edge Function check-enrollment nunca se llegó a invocar desde
-- que el cron se activó.

create extension if not exists pg_net;
