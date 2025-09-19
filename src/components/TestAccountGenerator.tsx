import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { CheckCircle, User, Key, Eye, EyeOff } from 'lucide-react';

interface TestAccount {
  email: string;
  password: string;
  role: 'admin' | 'vendor' | 'depot' | 'engineer' | 'inspector';
  name: string;
  created: boolean;
}

export function TestAccountGenerator() {
  const { register, login } = useAuth();
  const [accounts, setAccounts] = useState<TestAccount[]>([
    {
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
      name: 'Test Admin',
      created: false
    },
    {
      email: 'vendor@test.com',
      password: 'vendor123',
      role: 'vendor',
      name: 'Test Vendor',
      created: false
    },
    {
      email: 'depot@test.com',
      password: 'depot123',
      role: 'depot',
      name: 'Test Depot Manager',
      created: false
    },
    {
      email: 'engineer@test.com',
      password: 'engineer123',
      role: 'engineer',
      name: 'Test Engineer',
      created: false
    },
    {
      email: 'inspector@test.com',
      password: 'inspector123',
      role: 'inspector',
      name: 'Test Inspector',
      created: false
    }
  ]);
  const [creating, setCreating] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const createAccount = async (account: TestAccount) => {
    setCreating(account.email);
    try {
      await register(account.email, account.password, {
        name: account.name,
        role: account.role,
        organizationId: `org-${account.role}`,
        organizationName: `${account.role.charAt(0).toUpperCase() + account.role.slice(1)} Organization`
      });
      
      setAccounts(prev => prev.map(acc => 
        acc.email === account.email ? { ...acc, created: true } : acc
      ));
    } catch (error) {
      console.error(`Error creating ${account.role} account:`, error);
      // If account already exists, mark as created
      if (error instanceof Error && error.message.includes('already-in-use')) {
        setAccounts(prev => prev.map(acc => 
          acc.email === account.email ? { ...acc, created: true } : acc
        ));
      }
    } finally {
      setCreating(null);
    }
  };

  const loginAsAccount = async (account: TestAccount) => {
    try {
      await login(account.email, account.password);
    } catch (error) {
      console.error(`Error logging in as ${account.role}:`, error);
    }
  };

  const createAllAccounts = async () => {
    for (const account of accounts) {
      if (!account.created) {
        await createAccount(account);
        // Small delay between creations
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'vendor': return 'warning';
      case 'depot': return 'info';
      case 'engineer': return 'success';
      case 'inspector': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Account Generator</h1>
        <p className="text-gray-600">Create test accounts for all dashboard roles</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Test Accounts</h2>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowPasswords(!showPasswords)}
                variant="outline"
                size="sm"
                leftIcon={showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              >
                {showPasswords ? 'Hide' : 'Show'} Passwords
              </Button>
              <Button 
                onClick={createAllAccounts}
                variant="outline"
                size="sm"
                disabled={accounts.every(acc => acc.created)}
              >
                Create All Accounts
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div key={account.email} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">{account.name}</span>
                  </div>
                  <Badge variant={getRoleColor(account.role)} size="sm">
                    {account.role}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-mono text-xs">{account.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Password:</span>
                    <p className="font-mono text-xs">
                      {showPasswords ? account.password : '••••••••'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => createAccount(account)}
                    disabled={account.created || creating === account.email}
                    size="sm"
                    className="flex-1"
                  >
                    {creating === account.email ? 'Creating...' : account.created ? 'Created' : 'Create'}
                    {account.created && <CheckCircle className="h-4 w-4 ml-1" />}
                  </Button>
                  
                  <Button
                    onClick={() => loginAsAccount(account)}
                    disabled={!account.created}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Login
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Instructions</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">1</span>
            </div>
            <div>
              <p className="font-medium">Create Test Accounts</p>
              <p className="text-sm text-gray-600">Click "Create" for each role or "Create All Accounts" to generate all test users at once.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">2</span>
            </div>
            <div>
              <p className="font-medium">Login to Test Dashboards</p>
              <p className="text-sm text-gray-600">Click "Login" to automatically sign in with that role and see their specific dashboard.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">3</span>
            </div>
            <div>
              <p className="font-medium">Test All Features</p>
              <p className="text-sm text-gray-600">Each role has different permissions and dashboard features. Test the complete workflow!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
