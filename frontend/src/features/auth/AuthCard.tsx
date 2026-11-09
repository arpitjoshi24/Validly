"use client";

import { useRouter } from "next/navigation";
import {
  forwardRef,
  useId,
  useMemo,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_HOME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";
import { authApi } from "./auth.api";
import { loginSchema, registerSchema, type LoginValues, type RegisterValues } from "./auth.schema";

type Mode = "register" | "login";

const ROLES = [
  { value: "FOUNDER", title: "I have an idea", body: "Publish a concept and measure real demand." },
  { value: "CONSUMER", title: "I want to vote", body: "Shape new products. Always free." },
] as const;

/* Primary button look: bone accent with dark text, brightens on hover */
const PRIMARY_BTN =
  "h-12 w-full rounded-xl bg-brand text-[15px] font-semibold text-canvas shadow-[0_10px_24px_-10px] shadow-brand/60 transition hover:bg-brand hover:brightness-110 active:scale-[0.99]";

/* ------------------------------------------------------------------ */
/* Icons                                                               */
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
/* Fields                                                              */
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
            error ? "text-danger" : "text-ink-soft group-focus-within:text-brand"
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
            "peer h-14 w-full rounded-xl border bg-canvas pb-1 pl-11 pr-12 pt-5 text-[15px] text-ink outline-none transition",
            "placeholder-transparent focus:ring-4 focus:ring-brand/15",
            error ? "border-danger focus:border-danger" : "border-line hover:border-ink-soft/40 focus:border-brand",
            className
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-[15px] text-ink-soft transition-all duration-150",
            "peer-focus:top-[1.15rem] peer-focus:text-xs peer-focus:text-brand",
            "peer-[:not(:placeholder-shown)]:top-[1.15rem] peer-[:not(:placeholder-shown)]:text-xs"
          )}
        >
          {label}
        </label>
        {trailing && <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error ? (
        <p id={msgId} role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-danger">
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

const PasswordField = forwardRef<HTMLInputElement, Omit<FieldProps, "icon" | "trailing" | "type">>(
  function PasswordField(props, ref) {
    const [show, setShow] = useState(false);
    return (
      <Field
        ref={ref}
        {...props}
        type={show ? "text" : "password"}
        icon={<LockIcon />}
        trailing={
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="grid h-10 w-10 place-items-center rounded-lg text-ink-soft transition hover:bg-surface hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15"
          >
            <EyeIcon off={show} />
          </button>
        }
      />
    );
  }
);

function scorePassword(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) s++;
  if (pw.length >= 12) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const STRENGTH = [
  { label: "Keep going", bar: "bg-line" },
  { label: "Weak", bar: "bg-danger" },
  { label: "Okay", bar: "bg-signal" },
  { label: "Good", bar: "bg-brand/70" },
  { label: "Strong", bar: "bg-brand" },
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

function RolePicker({
  role,
  inputProps,
}: {
  role: RegisterValues["role"];
  inputProps: ReturnType<ReturnType<typeof useForm<RegisterValues>>["register"]>;
}) {
  const index = ROLES.findIndex((r) => r.value === role);
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink">How will you use Validly?</legend>
      <div className="relative grid grid-cols-2 rounded-2xl border border-line bg-canvas p-1">
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl border border-brand/40 bg-surface shadow-[0_6px_20px_-8px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-[cubic-bezier(.4,1.3,.5,1)]"
          style={{ transform: `translateX(${index * 100}%)` }}
        />
        {ROLES.map((r) => {
          const active = role === r.value;
          return (
            <label
              key={r.value}
              className="relative z-10 cursor-pointer rounded-xl p-3.5 focus-within:ring-4 focus-within:ring-brand/15"
            >
              <input type="radio" value={r.value} className="sr-only" {...inputProps} />
              <span className="flex items-center justify-between gap-2">
                <span className={cn("text-sm font-semibold transition-colors", active ? "text-brand" : "text-ink")}>
                  {r.title}
                </span>
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all duration-200",
                    active ? "scale-100 border-brand bg-brand text-canvas" : "scale-90 border-line text-transparent"
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
/* Register form                                                       */
/* ------------------------------------------------------------------ */

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const { setUser } = useAuth();

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
          <PasswordField
            label="Password"
            autoComplete="new-password"
            hint={password ? undefined : "At least 8 characters, with a letter and a number"}
            error={errors.password?.message}
            {...register("password")}
          />
          <StrengthMeter password={password} />
        </div>
      </div>

      <Button type="submit" loading={isSubmitting} className={PRIMARY_BTN}>
        {role === "FOUNDER" ? "Create account and start validating" : "Create account and start voting"}
      </Button>

      <p className="text-center text-sm text-ink-soft md:hidden">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold text-brand underline-offset-4 hover:underline">
          Log in
        </button>
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Login form                                                          */
/* ------------------------------------------------------------------ */

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setServerError("");
    try {
      const user = await authApi.login(values);

      if (!user || !user.id || !user.role) {
        throw new Error("Invalid login response. Please check your authentication API.");
      }

      const role = user.role as Role;
      if (!Object.prototype.hasOwnProperty.call(ROLE_HOME, role)) {
        throw new Error(`Unsupported account role: ${user.role}`);
      }

      setUser(user);
      toast.success("Login successful!");
      router.replace(ROLE_HOME[role]);
      router.refresh();
    } catch (error) {
      console.error("Login failed:", error);
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setServerError(message);
      toast.error(message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-3.5">
        <Field
          label="Email"
          type="email"
          icon={<MailIcon />}
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      {serverError && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
          <span className="mt-0.5">
            <AlertIcon />
          </span>
          {serverError}
        </div>
      )}

      <Button type="submit" loading={isSubmitting} disabled={isSubmitting} className={PRIMARY_BTN}>
        {isSubmitting ? "Signing in..." : "Log in"}
      </Button>

      <p className="text-center text-sm text-ink-soft md:hidden">
        New to Validly?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold text-brand underline-offset-4 hover:underline">
          Create an account
        </button>
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Sliding content panel                                               */
/* ------------------------------------------------------------------ */

const BASICS = [
  { title: "Founders test first", body: "Publish a concept and see real demand before you pay for packaging or production." },
  { title: "Consumers vote for free", body: "Vote, comment and join waitlists. You never pay to give feedback." },
  { title: "Demand, not vanity metrics", body: "Views, votes, waitlists and reservations are tracked separately." },
];

function AboutBlock() {
  return (
    <ul className="space-y-4">
      {BASICS.map((b) => (
        <li key={b.title} className="flex gap-3">
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/20 text-brand">
            <CheckIcon />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{b.title}</p>
            <p className="mt-0.5 text-sm leading-snug text-ink/70">{b.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Message({
  visible,
  title,
  body,
  cta,
  onClick,
}: {
  visible: boolean;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "absolute inset-0 transition-all duration-500",
        visible ? "visible translate-y-0 opacity-100 delay-300" : "invisible translate-y-3 opacity-0"
      )}
    >
      <h2 className="text-3xl font-semibold leading-[1.1] tracking-tight text-ink">{title}</h2>
      <p className="mt-2.5 max-w-xs text-sm text-ink/75">{body}</p>
      <button
        type="button"
        onClick={onClick}
        tabIndex={visible ? 0 : -1}
        className="mt-5 h-10 rounded-full border-2 border-brand px-7 text-sm font-semibold text-brand transition hover:bg-brand hover:text-canvas focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
      >
        {cta}
      </button>
    </div>
  );
}

function ContentPanel({ mode, onSwitch }: { mode: Mode; onSwitch: (m: Mode) => void }) {
  return (
    <div
      className={cn(
        "absolute left-0 top-0 z-20 hidden h-full w-1/2 overflow-hidden bg-linear-to-br from-line via-surface to-canvas text-ink md:block",
        "transition-transform duration-[800ms] ease-[cubic-bezier(.7,0,.2,1)]"
      )}
      style={{ transform: mode === "register" ? "translateX(100%)" : "translateX(0%)" }}
    >
      <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/25 blur-3xl" />
      <div aria-hidden className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-black/40 blur-3xl" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-brand) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative flex h-full flex-col justify-between p-8">
        <div className="flex items-center gap-2.5 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-canvas">
            <CheckIcon />
          </span>
          <span className="text-lg tracking-tight">Validly</span>
        </div>

        <div className="relative h-[200px]">
          <Message
            visible={mode === "register"}
            title="Validate before you manufacture."
            body="Test your product idea with real consumer feedback before you pay for packaging or production."
            cta="Log in"
            onClick={() => onSwitch("login")}
          />
          <Message
            visible={mode === "login"}
            title="Welcome back."
            body="Pick up where you left off. Your campaigns and votes are right where you left them."
            cta="Create account"
            onClick={() => onSwitch("register")}
          />
        </div>

        <AboutBlock />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The card: render this on both /login and /register                  */
/* ------------------------------------------------------------------ */

export function AuthCard({ initialMode = "register" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);

  function switchTo(next: Mode) {
    if (next === mode) return;
    setMode(next);
    // Keep the URL in sync without a page reload so the slide stays smooth
    window.history.replaceState(null, "", next === "login" ? "/login" : "/register");
  }

  const isRegister = mode === "register";

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-canvas p-4 text-ink sm:p-8">
      <div aria-hidden className="absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-brand-tint blur-3xl" />
      <div aria-hidden className="absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-brand-tint blur-3xl" />

      <div className="relative w-full max-w-[920px] overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] md:h-[660px]">
        {/* Register form: left half */}
        <section
          aria-hidden={!isRegister}
          className={cn(
            "overflow-y-auto px-6 py-8 transition-all duration-700 sm:px-9 md:absolute md:left-0 md:top-0 md:h-full md:w-1/2",
            isRegister
              ? "visible translate-x-0 opacity-100 delay-200"
              : "invisible hidden opacity-0 md:block md:-translate-x-8"
          )}
        >
          <div className="mx-auto flex min-h-full w-full max-w-[400px] flex-col justify-center">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-[1.75rem]">Create your account</h1>
            <p className="mb-6 mt-1.5 text-ink-soft">Takes under a minute. No card needed.</p>
            <RegisterForm onSwitch={() => switchTo("login")} />
          </div>
        </section>

        {/* Login form: right half */}
        <section
          aria-hidden={isRegister}
          className={cn(
            "overflow-y-auto px-6 py-8 transition-all duration-700 sm:px-9 md:absolute md:right-0 md:top-0 md:h-full md:w-1/2",
            !isRegister
              ? "visible translate-x-0 opacity-100 delay-200"
              : "invisible hidden opacity-0 md:block md:translate-x-8"
          )}
        >
          <div className="mx-auto flex min-h-full w-full max-w-[400px] flex-col justify-center">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-[1.75rem]">Welcome back</h1>
            <p className="mb-6 mt-1.5 text-ink-soft">Log in to pick up where you left off.</p>
            <LoginForm onSwitch={() => switchTo("register")} />
          </div>
        </section>

        {/* Sliding content panel (desktop only) */}
        <ContentPanel mode={mode} onSwitch={switchTo} />
      </div>
    </main>
  );
}