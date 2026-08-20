import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import authService from "@/redux/auth/authService";
import {
  TwoFactorBackupCodesPanel,
  TwoFactorBenefitsList,
  TwoFactorCard,
  TwoFactorCodeInput,
  TwoFactorSetupSteps,
  TwoFactorStatusBadge,
  STOREFRONT_PRIMARY,
} from "@/components/two-factor/TwoFactorUi";

export default function TwoFactorSettings() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [setup, setSetup] = useState<{
    secret: string;
    qr_data_url: string;
    setup_token: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [disableCode, setDisableCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authService.getTwoFactorStatus();
      setEnabled(Boolean(data?.totp_enabled));
    } catch {
      setEnabled(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startSetup = async () => {
    setBusy(true);
    try {
      const data = await authService.startTwoFactorSetup();
      setSetup({
        secret: data.secret,
        qr_data_url: data.qr_data_url,
        setup_token: data.setup_token,
      });
      setBackupCodes(null);
      setCode("");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || "Could not start 2FA setup.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading 2FA status…</p>;
  }

  return (
    <div className="space-y-6">
      <TwoFactorCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h2 className="text-lg font-semibold text-gray-900">Why enable 2FA?</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              Your Hawola account holds orders, addresses, and payment methods. Two-factor
              authentication adds a powerful extra lock — so a leaked password alone cannot let
              someone in.
            </p>
          </div>
          <TwoFactorStatusBadge enabled={enabled} />
        </div>
        <div className="mt-5">
          <TwoFactorBenefitsList />
        </div>
      </TwoFactorCard>

      <TwoFactorCard>
        <h2 className="text-lg font-semibold text-gray-900">
          {enabled && !setup ? "Manage authenticator" : "Set up authenticator app"}
        </h2>
        {!enabled && !setup ? (
          <>
            <p className="mt-2 text-sm text-gray-600">
              Link an authenticator app on your phone. You will enter a code after your password
              whenever you sign in.
            </p>
            <div className="mt-5">
              <TwoFactorSetupSteps />
            </div>
          </>
        ) : null}

        {enabled && !setup ? (
          <div className="mt-5 space-y-4 rounded-xl border border-[#e2e8f2] bg-gray-50/60 p-4">
            <p className="text-sm text-gray-600">
              To turn off 2FA, verify with both your current password and an authenticator or
              backup code. We will also email you a security alert.
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Current password
              </label>
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Enter your password"
                className="h-12 w-full rounded-xl border border-[#dde4f0] bg-white px-4 text-sm text-gray-900 shadow-sm"
              />
            </div>
            <TwoFactorCodeInput
              id="storefront-disable-2fa"
              label="Verification code"
              value={disableCode}
              onChange={setDisableCode}
            />
            <button
              type="button"
              disabled={
                busy || disableCode.trim().length < 6 || disablePassword.trim().length < 6
              }
              onClick={async () => {
                setBusy(true);
                try {
                  await authService.disableTwoFactor(disableCode, disablePassword);
                  setEnabled(false);
                  setDisableCode("");
                  setDisablePassword("");
                  setBackupCodes(null);
                  toast.success("Authenticator 2FA is off. We sent a security alert email.");
                } catch (e: unknown) {
                  const err = e as { response?: { data?: { detail?: string } } };
                  toast.error(err?.response?.data?.detail || "Could not turn 2FA off.");
                } finally {
                  setBusy(false);
                }
              }}
              className="rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-60"
            >
              Turn off 2FA
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void startSetup()}
            className="mt-5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: STOREFRONT_PRIMARY }}
          >
            {setup ? "Generate a new QR code" : "Begin setup"}
          </button>
        )}

        {setup ? (
          <div
            className="mt-6 space-y-4 rounded-2xl border p-5"
            style={{ borderColor: `${STOREFRONT_PRIMARY}22`, backgroundColor: `${STOREFRONT_PRIMARY}08` }}
          >
            <p className="text-sm font-medium text-gray-800">Scan this QR code with your authenticator app</p>
            {setup.qr_data_url ? (
              <div className="flex justify-center">
                <img
                  src={setup.qr_data_url}
                  alt="Authenticator QR code"
                  className="h-48 w-48 rounded-xl border border-white bg-white p-3 shadow-sm"
                />
              </div>
            ) : null}
            <div className="rounded-xl border border-[#dde4f0] bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Manual entry key</p>
              <p className="mt-1 break-all font-mono text-sm text-gray-900">{setup.secret}</p>
            </div>
            <TwoFactorCodeInput
              id="storefront-confirm-2fa"
              label="Confirm with a 6-digit code"
              value={code}
              onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
            />
            <button
              type="button"
              disabled={busy || code.length !== 6}
              onClick={async () => {
                setBusy(true);
                try {
                  const data = await authService.confirmTwoFactorSetup(setup.setup_token, code);
                  setEnabled(true);
                  setSetup(null);
                  setBackupCodes(data.backup_codes || []);
                  setCode("");
                  toast.success("Authenticator 2FA is on.");
                } catch (e: unknown) {
                  const err = e as { response?: { data?: { detail?: string } } };
                  toast.error(err?.response?.data?.detail || "That code did not match.");
                } finally {
                  setBusy(false);
                }
              }}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: STOREFRONT_PRIMARY }}
            >
              Confirm and enable 2FA
            </button>
          </div>
        ) : null}

        {backupCodes?.length ? <TwoFactorBackupCodesPanel codes={backupCodes} /> : null}
      </TwoFactorCard>
    </div>
  );
}
