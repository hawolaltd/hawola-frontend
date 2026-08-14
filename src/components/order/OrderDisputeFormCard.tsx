"use client";

import dynamic from "next/dynamic";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

const TINYMCE_SCRIPT_SRC = "/tinymce/tinymce.min.js";

const tinymceInitBase = {
  height: 220,
  menubar: false,
  promotion: false,
  plugins: "lists link",
  toolbar: "undo redo | formatselect | bold italic | bullist numlist | link",
  content_style: "body { font-family: inherit; font-size: 14px; }",
  base_url: "/tinymce",
  suffix: ".min",
} as const;

const TinyMCEEditor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  { ssr: false }
);

export type OrderDisputeFormFields = {
  orderitem_number: string;
  dispute_reason: string;
  proof_image?: File | null;
  want_full_refund: boolean;
};

type Props = {
  isFormActive: boolean;
  isDelivered: boolean;
  isSubmitting: boolean;
  embedded?: boolean;
  register: ReturnType<typeof useForm<OrderDisputeFormFields>>["register"];
  control: ReturnType<typeof useForm<OrderDisputeFormFields>>["control"];
  errors: ReturnType<typeof useForm<OrderDisputeFormFields>>["formState"]["errors"];
  setValue: ReturnType<typeof useForm<OrderDisputeFormFields>>["setValue"];
  reset: ReturnType<typeof useForm<OrderDisputeFormFields>>["reset"];
  onSubmit: (data: OrderDisputeFormFields) => void | Promise<void>;
  handleSubmit: ReturnType<typeof useForm<OrderDisputeFormFields>>["handleSubmit"];
};

export default function OrderDisputeFormCard({
  isFormActive,
  isDelivered,
  isSubmitting,
  embedded = false,
  register,
  control,
  errors,
  setValue,
  reset,
  onSubmit,
  handleSubmit,
}: Props) {
  return (
    <section
      className={
        embedded
          ? "bg-transparent"
          : "rounded-2xl border border-[#d7e0ef] bg-white p-5 shadow-[0_10px_40px_rgba(11,27,51,0.05)] sm:p-6"
      }
    >
      <h3 className="text-lg font-semibold text-slate-900">
        Submit dispute
        {!isFormActive ? (
          <span className="mt-1 block text-sm font-normal text-red-500 sm:ml-2 sm:mt-0 sm:inline">
            Available after the order is received
          </span>
        ) : isDelivered ? (
          <span className="mt-1 block text-sm font-normal text-slate-500 sm:ml-2 sm:mt-0 sm:inline">
            Confirm delivery above, or open a dispute if something is wrong
          </span>
        ) : null}
      </h3>

      <form
        onSubmit={handleSubmit(onSubmit, (validationErrors) => {
          const first = Object.keys(validationErrors)[0];
          if (first === "dispute_reason") toast.error("Please enter a dispute reason.");
          else if (first) toast.error("Please check the form and try again.");
        })}
        className="mt-4 space-y-4"
      >
        <input type="hidden" {...register("orderitem_number")} />

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Dispute reason *</label>
          <Controller
            name="dispute_reason"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TinyMCEEditor
                tinymceScriptSrc={TINYMCE_SCRIPT_SRC}
                licenseKey="gpl"
                value={field.value}
                onEditorChange={(content) => field.onChange(content ?? "")}
                init={{ ...tinymceInitBase }}
                disabled={!isFormActive}
              />
            )}
          />
          {errors?.dispute_reason ? (
            <p className="mt-1 text-sm text-red-600">{errors.dispute_reason.message}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Proof image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setValue("proof_image", file, { shouldValidate: true });
              else setValue("proof_image", null);
            }}
            className="w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
            disabled={!isFormActive}
          />
          {errors?.proof_image ? (
            <p className="mt-1 text-sm text-red-600">{String(errors.proof_image.message || "")}</p>
          ) : null}
          <p className="mt-1 text-xs text-slate-500">Max 5MB (JPG, PNG, GIF)</p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="want_full_refund"
            {...register("want_full_refund")}
            className="h-4 w-4 rounded border-slate-300 text-[#0B1B33] focus:ring-[#0B1B33]"
            disabled={!isFormActive}
          />
          <label htmlFor="want_full_refund" className="ml-2 block text-sm text-slate-700">
            I want a full refund
          </label>
        </div>

        {isFormActive ? (
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting…" : "Submit dispute"}
            </button>
          </div>
        ) : null}
      </form>
    </section>
  );
}
