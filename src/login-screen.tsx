import React from 'react';
import { Card } from './components/card';
import { Button } from './components/button';
import { Input } from './components/input';
import { Label } from './components/label';

export const LoginScreen = () => {
  return (
    <div className='flex min-h-screen items-center justify-center bg-white dark:bg-deep-sea p-4'>
      <Card className='w-full max-w-sm p-6'>
        <div className='space-y-6'>
          <div className='space-y-1.5 text-center'>
            <h2 className='text-2xl font-semibold tracking-tight text-text-primary dark:text-text-primary'>Welcome Back</h2>
            <p className='text-sm text-text-secondary dark:text-text-secondary'>Sign in to your account to continue.</p>
          </div>

          <form
            className='space-y-4'
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className='space-y-2'>
              <Label htmlFor='email'>Email Address</Label>
              <Input id='email' type='email' placeholder='jane@example.com' required />
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='password'>Password</Label>
                <a href='#' className='text-sm font-medium text-sea hover:underline dark:text-accent-blue'>
                  Forgot password?
                </a>
              </div>
              <Input id='password' type='password' required />
              <p className='text-xs text-terracotta mt-1'>This field is required.</p>
            </div>

            <Button className='w-full mt-2' type='submit'>
              Sign In
            </Button>
          </form>

          <div className='text-center text-sm text-text-secondary dark:text-text-secondary'>
            Don't have an account?{' '}
            <a href='#' className='font-medium text-sea hover:underline dark:text-accent-blue'>
              Sign up
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
};
