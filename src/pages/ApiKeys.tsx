import { useState, type FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Key, Plus, Copy, Eye, EyeOff, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

const initialKeys: ApiKey[] = [];

const allPermissions = [
  { id: 'read', label: 'Read' },
  { id: 'write', label: 'Write' },
  { id: 'webhook', label: 'Webhook' },
];

const maskKey = (key: string) => key.slice(0, 7) + '•'.repeat(20) + key.slice(-4);

const ApiKeys: FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);
  const [newName, setNewName] = useState('');
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredKeys = keys.filter((k) => k.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  const handleCreate = () => {
    if (!newName.trim() || newPermissions.length === 0) {
      toast.error('Please provide a name and select at least one permission');
      return;
    }
    const generated = `sk_live_${Array.from(
      { length: 32 },
      () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
    ).join('')}`;
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newName,
      key: generated,
      permissions: newPermissions,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      status: 'active',
    };
    setKeys((prev) => [newKey, ...prev]);
    setRevealedKeys((prev) => new Set(prev).add(newKey.id));
    setNewName('');
    setNewPermissions([]);
    setCreateOpen(false);
    toast.success('API key generated successfully');
  };

  const handleRevoke = (id: string) => {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k)));
    toast.success('API key revoked');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setKeys((prev) => prev.filter((k) => k.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast.success('API key deleted');
  };

  const togglePermission = (perm: string) => {
    setNewPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>API Key Management</h1>
          <p className='text-sm text-muted-foreground'>Generate, view, and manage API keys</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className='gap-2'>
          <Plus size={16} /> Generate New Key
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Total Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>{keys.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Active Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-emerald-600'>
              {keys.filter((k) => k.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Revoked Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-destructive'>
              {keys.filter((k) => k.status === 'revoked').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <CardTitle className='text-lg'>API Keys</CardTitle>
            <Input
              placeholder='Search keys...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='max-w-xs'
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className='font-medium'>{apiKey.name}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <code className='text-xs text-muted-foreground'>
                          {revealedKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                        </code>
                        <button
                          onClick={() => toggleReveal(apiKey.id)}
                          className='text-muted-foreground hover:text-foreground'
                        >
                          {revealedKeys.has(apiKey.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => copyKey(apiKey.key)}
                          className='text-muted-foreground hover:text-foreground'
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-1'>
                        {apiKey.permissions.map((p) => (
                          <Badge key={p} variant='secondary' className='text-xs'>
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className='text-muted-foreground'>{apiKey.createdAt}</TableCell>
                    <TableCell className='text-muted-foreground'>{apiKey.lastUsed}</TableCell>
                    <TableCell>
                      <Badge variant={apiKey.status === 'active' ? 'default' : 'destructive'}>
                        {apiKey.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        {apiKey.status === 'active' && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleRevoke(apiKey.id)}
                          >
                            Revoke
                          </Button>
                        )}
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-destructive hover:text-destructive'
                          onClick={() => setDeleteTarget(apiKey)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredKeys.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className='py-8 text-center text-muted-foreground'>
                      <Key className='mx-auto mb-2 h-8 w-8 opacity-40' />
                      No API keys found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New API Key</DialogTitle>
            <DialogDescription>Create a new API key with specific permissions.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label>Key Name</Label>
              <Input
                placeholder='e.g. Production API'
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label>Permissions</Label>
              <div className='space-y-2'>
                {allPermissions.map((perm) => (
                  <div key={perm.id} className='flex items-center gap-2'>
                    <Checkbox
                      id={perm.id}
                      checked={newPermissions.includes(perm.id)}
                      onCheckedChange={() => togglePermission(perm.id)}
                    />
                    <Label htmlFor={perm.id} className='font-normal'>
                      {perm.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Generate Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertTriangle className='text-destructive' size={20} /> Delete API Key
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The key "{deleteTarget?.name}" will be permanently
              deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiKeys;
