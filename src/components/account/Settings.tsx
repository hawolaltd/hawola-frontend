import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  EnvelopeIcon,
  KeyIcon,
  MapPinIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import { getUserProfile, updateProfile, changePassword } from "@/redux/auth/authSlice";
import { getAddress } from "@/redux/product/productSlice";
import { capitalize } from "@/util";
import { toast } from "sonner";

const inputClass =
  "h-11 w-full rounded-xl border border-detailsBorder bg-white px-4 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-detailsBorder bg-white p-5 shadow-[0_4px_24px_rgba(14,34,77,0.06)] sm:p-6 ${className}`}
    >
      <div className="mb-5 flex items-start gap-3">
        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        ) : null}
        <div>
          <h2 className="text-base font-bold text-headerBg sm:text-lg">{title}</h2>
          {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      {children}
    </label>
  );
}

function Spinner() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5 animate-spin text-white/80"
      viewBox="0 0 100 101"
      fill="none"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908Z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentColor"
      />
    </svg>
  );
}

function profileInitials(first?: string | null, last?: string | null, email?: string | null) {
  const a = (first || "").trim();
  const b = (last || "").trim();
  if (a && b) return `${a[0]}${b[0]}`.toUpperCase();
  if (a) return a.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

const Settings: NextPage = () => {
  const { profile } = useAppSelector((state) => state.auth);
  const { addresses } = useAppSelector((state) => state.products);
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [contactInfo, setContactInfo] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    username: profile?.username || "",
    phone_number: profile?.phone_number || "",
    email: profile?.email || "",
    keepUpdated: false,
  });

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password1: "",
    new_password2: "",
  });

  useEffect(() => {
    if (profile) {
      setContactInfo({
        first_name: profile?.first_name || "",
        last_name: profile?.last_name || "",
        username: profile?.username || "",
        phone_number: profile?.phone_number || "",
        email: profile?.email || "",
        keepUpdated: false,
      });
    }
  }, [profile]);

  useEffect(() => {
    dispatch(getUserProfile());
    dispatch(getAddress());
  }, [dispatch]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await dispatch(updateProfile(contactInfo));
      toast.success("Profile updated successfully");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.old_password || !passwordData.new_password1 || !passwordData.new_password2) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwordData.new_password1 !== passwordData.new_password2) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.new_password1.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setPasswordLoading(true);
    try {
      await dispatch(
        changePassword({
          old_password: passwordData.old_password,
          new_password1: passwordData.new_password1,
          new_password2: passwordData.new_password2,
        })
      );
      toast.success("Password changed successfully");
      setPasswordData({ old_password: "", new_password1: "", new_password2: "" });
      setShowPasswordForm(false);
    } catch (e: any) {
      const errorMessage =
        e?.response?.data?.detail ||
        e?.response?.data?.old_password?.[0] ||
        e?.response?.data?.new_password2?.[0] ||
        "Failed to change password";
      toast.error(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
    profile?.username ||
    "Your profile";

  return (
    <div className="space-y-6 pb-8">
      <header className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary via-headerBg to-[#1E3A8A] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {profile?.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt=""
                className="h-16 w-16 rounded-2xl border-2 border-white/20 object-cover shadow-md"
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-xl font-bold shadow-md"
                aria-hidden
              >
                {profileInitials(profile?.first_name, profile?.last_name, profile?.email)}
              </div>
            )}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                Account profile
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{displayName}</h1>
              <p className="mt-1 text-sm text-white/85">{profile?.email}</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/90">
            <p className="font-semibold text-white">@{profile?.username || "username"}</p>
            <p className="mt-0.5 text-xs text-white/75">Manage your personal details and security.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard
            title="Personal information"
            description="Update how we reach you for orders and account updates."
            icon={UserCircleIcon}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="First name">
                <input
                  type="text"
                  value={contactInfo.first_name}
                  onChange={(e) => setContactInfo({ ...contactInfo, first_name: e.target.value })}
                  className={inputClass}
                  placeholder="First name"
                />
              </Field>
              <Field label="Last name">
                <input
                  type="text"
                  value={contactInfo.last_name}
                  onChange={(e) => setContactInfo({ ...contactInfo, last_name: e.target.value })}
                  className={inputClass}
                  placeholder="Last name"
                />
              </Field>
              <Field label="Username">
                <input
                  type="text"
                  value={contactInfo.username}
                  onChange={(e) => setContactInfo({ ...contactInfo, username: e.target.value })}
                  className={inputClass}
                  placeholder="Username"
                />
              </Field>
              <Field label="Phone number">
                <input
                  type="tel"
                  value={contactInfo.phone_number || ""}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone_number: e.target.value })}
                  className={inputClass}
                  placeholder="Phone number"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Email address">
                  <div className="relative">
                    <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={contactInfo.email}
                      disabled
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">Email cannot be changed here.</p>
                </Field>
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-detailsBorder bg-gray-50/80 px-4 py-3">
              <input
                type="checkbox"
                checked={contactInfo.keepUpdated}
                onChange={(e) => setContactInfo({ ...contactInfo, keepUpdated: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-gray-700">
                Keep me up to date on news and exclusive offers from Hawola.
              </span>
            </label>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={loading}
                onClick={() => void handleSave()}
                className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#354a73] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Spinner /> : null}
                {loading ? "Saving…" : "Save changes"}
              </button>
            </div>
          </SectionCard>

          <SectionCard
            title="Password & security"
            description="Use a strong password you do not reuse on other sites."
            icon={KeyIcon}
          >
            {!showPasswordForm ? (
              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-detailsBorder bg-gray-50/60 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  Change your password regularly to keep your account secure.
                </p>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(true)}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
                >
                  Change password
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Field label="Current password">
                  <input
                    type="password"
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                    className={inputClass}
                    autoComplete="current-password"
                  />
                </Field>
                <Field label="New password">
                  <input
                    type="password"
                    value={passwordData.new_password1}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password1: e.target.value })}
                    className={inputClass}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                  />
                </Field>
                <Field label="Confirm new password">
                  <input
                    type="password"
                    value={passwordData.new_password2}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password2: e.target.value })}
                    className={inputClass}
                    autoComplete="new-password"
                  />
                </Field>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    disabled={passwordLoading}
                    onClick={() => void handlePasswordChange()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#354a73] disabled:opacity-60"
                  >
                    {passwordLoading ? <Spinner /> : null}
                    {passwordLoading ? "Updating…" : "Update password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({ old_password: "", new_password1: "", new_password2: "" });
                    }}
                    className="rounded-xl border border-detailsBorder bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </SectionCard>

          <section className="rounded-2xl border border-red-200/80 bg-red-50/40 p-5 sm:p-6">
            <h2 className="text-base font-bold text-headerBg">Account deletion</h2>
            <p className="mt-2 text-sm text-gray-600">
              Request permanent deletion of your Hawola account and associated personal data.
            </p>
            <Link
              href="/account/delete"
              className="mt-4 inline-flex items-center rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
            >
              Request account deletion
            </Link>
          </section>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Saved addresses"
            description="Addresses used for checkout and delivery."
            icon={MapPinIcon}
          >
            {addresses?.addresses?.length ? (
              <ul className="space-y-3">
                {addresses.addresses.map((address, index) => (
                  <li
                    key={address?.id}
                    className="rounded-xl border border-detailsBorder bg-gradient-to-br from-white to-gray-50/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-headerBg">
                        {capitalize(address?.first_name)} {capitalize(address?.last_name)}
                      </p>
                      {index === 0 ? (
                        <span className="rounded-full bg-secondaryTextColor/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondaryTextColor">
                          Primary
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-gray-600 break-words">{address?.address}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {address?.city?.name}
                      {address?.postalCode ? ` · ${address.postalCode}` : ""}
                    </p>
                    {address?.phone ? (
                      <p className="mt-2 text-sm font-medium text-primary">{address.phone}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-detailsBorder bg-gray-50/70 px-4 py-8 text-center">
                <MapPinIcon className="mx-auto h-10 w-10 text-gray-300" aria-hidden />
                <p className="mt-3 text-sm font-medium text-gray-700">No saved addresses yet</p>
                <p className="mt-1 text-sm text-gray-500">
                  Add an address during checkout and it will appear here.
                </p>
                <Link
                  href="/carts"
                  className="mt-4 inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-[#354a73]"
                >
                  Go to cart
                </Link>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Settings;
