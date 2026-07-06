-- Reparar usuario demo de certificados para login con Supabase Auth (GoTrue).

UPDATE auth.users
SET
  encrypted_password = extensions.crypt('CertDemo2026!', extensions.gen_salt('bf')),
  email_confirmed_at = coalesce(email_confirmed_at, timezone('utc'::text, now())),
  confirmation_token = '',
  recovery_token = '',
  email_change_token_new = '',
  email_change = '',
  aud = 'authenticated',
  role = 'authenticated',
  updated_at = timezone('utc'::text, now())
WHERE email = 'certificado.demo@cee-fiis.pe';

UPDATE auth.identities
SET
  provider_id = 'certificado.demo@cee-fiis.pe',
  identity_data = jsonb_build_object(
    'sub', 'eee11111-1111-1111-1111-111111111111',
    'email', 'certificado.demo@cee-fiis.pe',
    'email_verified', true,
    'phone_verified', false,
    'provider', 'email'
  ),
  updated_at = timezone('utc'::text, now())
WHERE user_id = 'eee11111-1111-1111-1111-111111111111'
  AND provider = 'email';
