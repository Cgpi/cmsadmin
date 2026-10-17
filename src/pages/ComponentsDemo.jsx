import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Package, Inbox } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { CardSkeleton, TableRowSkeleton, ImageGridSkeleton } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { useToast } from '../components/ui/useToast'

export default function ComponentsDemo() {
  const [modalOpen, setModalOpen] = useState(false)
  const toast = useToast()

  return (
    <AppShell pageTitle="Components Demo">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-8"
      >
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Component Library</h2>
          <p className="mt-1 text-sm text-slate-500">Preview the reusable UI primitives. Fire toasts in the top-right.</p>
        </div>

        {/* Buttons */}
        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
            <Button loading>Loading</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badges & Pills">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="neutral">Draft</Badge>
            <Badge tone="green" dot>Active</Badge>
            <Badge tone="amber" dot>Pending</Badge>
            <Badge tone="red" dot>Overdue</Badge>
            <Badge tone="blue">Info</Badge>
            <Badge tone="amberSolid">Site Admin</Badge>
            <Badge tone="greenSolid">Verified</Badge>
          </div>
        </Section>

        {/* Toasts */}
        <Section title="Toasts">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => toast.success('Project "Riverside Tower" was archived.')}>
              Success toast
            </Button>
            <Button variant="secondary" onClick={() => toast.error('Could not connect to the scheduling service.')}>
              Error toast
            </Button>
            <Button variant="secondary" onClick={() => toast.warning('Your license expires in 7 days.')}>
              Warning toast
            </Button>
            <Button variant="secondary" onClick={() => toast.info('A new version of the platform is available.')}>
              Info toast
            </Button>
            <Button variant="secondary" onClick={() => toast.success('Titled toast with a message body.', { title: 'Saved' })}>
              Titled toast
            </Button>
          </div>
        </Section>

        {/* Modal */}
        <Section title="Modal">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>Open modal</Button>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Confirm deletion"
            description="This action cannot be undone."
            footer={
              <>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button variant="danger" onClick={() => { setModalOpen(false); toast.success('Item deleted.') }}>
                  Delete
                </Button>
              </>
            }
          >
            <p className="text-sm text-slate-600">
              Are you sure you want to remove this project? All associated tasks, documents, and crew assignments will be detached.
            </p>
          </Modal>
        </Section>

        {/* Skeletons */}
        <Section title="Skeleton Loaders">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <Card>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Project</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Crew</th>
                    <th className="px-6 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  <TableRowSkeleton columns={4} />
                  <TableRowSkeleton columns={4} />
                  <TableRowSkeleton columns={4} />
                </tbody>
              </table>
            </Card>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <ImageGridSkeleton key={i} />)}
            </div>
          </div>
        </Section>

        {/* Empty states */}
        <Section title="Empty States">
          <div className="grid gap-4 sm:grid-cols-3">
            <EmptyState
              icon={Inbox}
              title="No messages"
              description="When crew members message you, they'll appear here."
            />
            <EmptyState
              icon={Package}
              title="No equipment assigned"
              description="Assign machinery to this project to track utilization."
              action={<Button size="sm">Assign equipment</Button>}
            />
            <EmptyState
              icon={Bell}
              title="You're all caught up"
              description="No new notifications right now."
            />
          </div>
        </Section>

        {/* Card anatomy */}
        <Section title="Card">
          <div className="max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>Project summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Riverside Tower — Phase 2 is 64% complete and on schedule.</p>
                <div className="mt-4 flex gap-2">
                  <Badge tone="green" dot>Active</Badge>
                  <Badge tone="blue">12 tasks</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        <p className="pb-4 text-center text-xs text-slate-400">
          This page is a temporary preview. It will be removed in the next phase.
        </p>
      </motion.div>
    </AppShell>
  )
}

function Section({ title, children }) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      {children}
    </Card>
  )
}
