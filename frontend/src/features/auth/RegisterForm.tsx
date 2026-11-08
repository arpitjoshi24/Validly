"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef, useEffect, useId, useMemo, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_HOME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { authApi } from "./auth.api";
import { registerSchema, type RegisterValues } from "./auth.schema";

type Role = RegisterValues["role"];

const ROLES = [
  { value: "FOUNDER", title: "I have an idea", body: "Publish a concept and measure real demand." },
  { value: "CONSUMER", title: "I want to vote", body: "Shape new products. Always free." },
] as const;

/* ------------------------------------------------------------------ */
/* Icons (inline so there are no new dependencies)                     */
/* ------------------------------------------------------------------ */

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const UserIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
  </svg>
);
const MailIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);
const LockIcon = () => (
  <svg {...iconProps}>
    <rect x="4" y="11" width="16" height="9" rx="3" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
const EyeIcon = ({ off }: { off: boolean }) => (
  <svg {...iconProps}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M4 4l16 16" />}
  </svg>
);
const AlertIcon = () => (
  <svg {...iconProps} width={14} height={14}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16.5v.01" />
  </svg>
);
const CheckIcon = () => (
  <svg {...iconProps} width={14} height={14} strokeWidth={2.4}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Floating-label field                                                */
/* ------------------------------------------------------------------ */

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: ReactNode;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
};

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, icon, error, hint, trailing, className, ...props },
  ref
) {
  const id = useId();
  const msgId = `${id}-msg`;

  return (
    <div>
      <div className="group relative">
        <span
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
            error ? "text-red-500" : "text-ink-soft group-focus-within:text-brand"
          )}
        >
          {icon}
        </span>
        <input
          ref={ref}
          id={id}
          placeholder=" "
          aria-invalid={!!error}
          aria-describedby={error || hint ? msgId : undefined}
          className={cn(
            "peer h-14 w-full rounded-xl border bg-surface pb-1 pl-11 pr-12 pt-5 text-[15px] outline-none transition",
            "placeholder-transparent focus:ring-4 focus:ring-brand-tint",
            error ? "border-red-500 focus:border-red-500" : "border-line hover:border-ink-soft/40 focus:border-brand",
            className
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-[15px] text-ink-soft transition-all duration-150",
            "peer-focus:top-[1.15rem] peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-[1.15rem] peer-[:not(:placeholder-shown)]:text-xs",
            "peer-focus:text-brand"
          )}
        >
          {label}
        </label>
        {trailing && <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error ? (
        <p id={msgId} role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertIcon /> {error}
        </p>
      ) : hint ? (
        <p id={msgId} className="mt-1.5 text-xs text-ink-soft">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Password strength                                                   */
/* ------------------------------------------------------------------ */

function scorePassword(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) s++;
  if (pw.length >= 12) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0..4
}

const STRENGTH = [
  { label: "Keep going", bar: "bg-line" },
  { label: "Weak", bar: "bg-red-500" },
  { label: "Okay", bar: "bg-amber-500" },
  { label: "Good", bar: "bg-brand" },
  { label: "Strong", bar: "bg-emerald-500" },
];

function StrengthMeter({ password }: { password: string }) {
  const score = useMemo(() => scorePassword(password), [password]);
  if (!password) return null;
  const level = STRENGTH[score];
  return (
    <div className="mt-2.5 flex items-center gap-3" aria-live="polite">
      <div className="grid flex-1 grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn("h-1.5 rounded-full transition-colors duration-300", i < score ? level.bar : "bg-line")}
          />
        ))}
      </div>
      <span className="w-16 text-right text-xs font-medium text-ink-soft">{level.label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Role picker with sliding highlight                                  */
/* ------------------------------------------------------------------ */

function RolePicker({
  role,
  inputProps,
}: {
  role: Role;
  inputProps: ReturnType<ReturnType<typeof useForm<RegisterValues>>["register"]>;
}) {
  const index = ROLES.findIndex((r) => r.value === role);
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">How will you use Validly?</legend>
      <div className="relative grid grid-cols-2 rounded-2xl border border-line bg-canvas p-1">
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl border border-brand/30 bg-surface shadow-[0_6px_20px_-8px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-[cubic-bezier(.4,1.3,.5,1)]"
          style={{ transform: `translateX(${index * 100}%)` }}
        />
        {ROLES.map((r) => {
          const active = role === r.value;
          return (
            <label
              key={r.value}
              className="relative z-10 cursor-pointer rounded-xl p-3.5 focus-within:ring-4 focus-within:ring-brand-tint"
            >
              <input type="radio" value={r.value} className="sr-only" {...inputProps} />
              <span className="flex items-center justify-between gap-2">
                <span className={cn("text-sm font-semibold transition-colors", active ? "text-brand" : "text-ink")}>
                  {r.title}
                </span>
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all duration-200",
                    active ? "scale-100 border-brand bg-brand text-white" : "scale-90 border-line text-transparent"
                  )}
                >
                  <CheckIcon />
                </span>
              </span>
              <span className="mt-1 block text-xs leading-snug text-ink-soft">{r.body}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/* The form                                                            */
/* ------------------------------------------------------------------ */

export function RegisterForm({ onRoleChange }: { onRoleChange?: (role: Role) => void }) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "FOUNDER" },
  });

  const role = watch("role");
  const password = watch("password") ?? "";

  useEffect(() => {
    onRoleChange?.(role);
  }, [role, onRoleChange]);

  async function onSubmit(values: RegisterValues) {
    try {
      const user = await authApi.register(values);
      setUser(user);
      toast.success("Account created");
      router.replace(ROLE_HOME[user.role]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create your account");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <RolePicker role={role} inputProps={register("role")} />

      <div className="space-y-3.5">
        <Field label="Full name" icon={<UserIcon />} autoComplete="name" error={errors.name?.message} {...register("name")} />
        <Field
          label="Email"
          type="email"
          icon={<MailIcon />}
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <div>
          <Field
            label="Password"
            type={showPassword ? "text" : "password"}
            icon={<LockIcon />}
            autoComplete="new-password"
            hint={password ? undefined : "At least 8 characters, with a letter and a number"}
            error={errors.password?.message}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="grid h-10 w-10 place-items-center rounded-lg text-ink-soft transition hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-tint"
              >
                <EyeIcon off={showPassword} />
              </button>
            }
            {...register("password")}
          />
          <StrengthMeter password={password} />
        </div>
      </div>

      <Button
        type="submit"
        loading={isSubmitting}
        className="h-12 w-full rounded-xl text-[15px] font-semibold shadow-[0_10px_24px_-10px] shadow-brand transition active:scale-[0.99]"
      >
        {role === "FOUNDER" ? "Create account and start validating" : "Create account and start voting"}
      </Button>

      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Live preview panel: reacts to the selected role                     */
/* ------------------------------------------------------------------ */

function Bar({ label, value, delay }: { label: string; value: number; delay: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 80 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-white transition-[width] duration-[900ms] ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function FounderPreview() {
  return (
    <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
      <p className="text-sm text-white/70">Your concept, after 6 days</p>
      <h3 className="mt-1 text-xl font-semibold">Foldable standing desk for small flats</h3>
      <div className="mt-6 space-y-4">
        <Bar label="Would buy" value={68} delay={0} />
        <Bar label="Interested, needs a lower price" value={21} delay={120} />
        <Bar label="Not for me" value={11} delay={240} />
      </div>
      <div className="mt-6 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-brand">
        <span className="text-sm font-semibold">Verdict: build it</span>
        <span className="text-sm tabular-nums">1,284 votes</span>
      </div>
    </div>
  );
}

function ConsumerPreview() {
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);
  return (
    <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
      <p className="text-sm text-white/70">New concept near you</p>
      <h3 className="mt-1 text-xl font-semibold">Lunchbox that keeps food warm for 8 hours</h3>
      <p className="mt-2 text-sm text-white/80">
        Stainless steel, USB-C rechargeable, fits a standard backpack pocket.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {(["yes", "no"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChoice(c)}
            className={cn(
              "h-12 rounded-2xl border text-sm font-semibold transition active:scale-95",
              choice === c
                ? "border-white bg-white text-brand"
                : "border-white/30 bg-transparent text-white hover:bg-white/10"
            )}
          >
            {c === "yes" ? "I'd buy this" : "Not for me"}
          </button>
        ))}
      </div>
      <p className="mt-4 h-5 text-sm text-white/80" aria-live="polite">
        {choice ? "Vote counted. Try it, this one is on the house." : "Tap one. Voting is always free."}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Full screen: use this as the content of your /register page         */
/* ------------------------------------------------------------------ */

export function RegisterScreen() {
  const [role, setRole] = useState<Role>("FOUNDER");

  return (
    <main className="grid min-h-screen bg-canvas lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Form side */}
      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[440px]">
          <Link href="/" className="mb-8 inline-flex items-center gap-2.5 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
              <CheckIcon />
            </span>
            <span className="text-lg tracking-tight">Validly</span>
          </Link>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-[2rem]">
            Create your account
          </h1>
          <p className="mb-8 mt-2 text-ink-soft">Takes under a minute. No card needed.</p>
          <RegisterForm onRoleChange={setRole} />
        </div>
      </section>

      {/* Preview side */}
      <aside className="relative hidden overflow-hidden bg-brand text-white lg:flex lg:items-center lg:justify-center lg:p-14">
        <div aria-hidden className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-black/20 blur-3xl" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative w-full max-w-md">
          <h2 key={role} className="text-4xl font-semibold leading-[1.1] tracking-tight">
            {role === "FOUNDER" ? "Find out who wants it before you build it." : "Your vote decides what gets built."}
          </h2>
          <div key={`${role}-card`} className="mt-10">
            {role === "FOUNDER" ? <FounderPreview /> : <ConsumerPreview />}
          </div>
        </div>
      </aside>
    </main>
  );
}