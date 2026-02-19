'use client';

import { useActionState, useEffect } from 'react';
import { signup } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-static';

export default function SignupPage() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(signup, undefined);

    useEffect(() => {
        if (state?.success && state?.redirect) {
            router.push(state.redirect);
        }
    }, [state, router]);

    return (
        <div className="flex min-h-screen bg-background items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-xl shadow-2xl overflow-hidden border border-border">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                            Safcha
                        </h1>
                        <p className="text-muted-foreground mt-2">Create your account</p>
                    </div>

                    <form action={formAction} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Full Name
                            </label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground transition-colors"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Email Address
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Password
                            </label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        {state?.error && (
                            <p className="text-destructive text-sm text-center">{state.error}</p>
                        )}

                        <button
                            disabled={isPending}
                            type="submit"
                            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
