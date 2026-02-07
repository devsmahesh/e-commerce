'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  useGetContactsQuery,
  useUpdateContactStatusMutation,
  useDeleteContactMutation,
  Contact,
} from '@/store/api/contactApi'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Trash2, Eye, Mail, Phone, Calendar, MessageSquare, CheckCircle, Clock, Archive, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Badge } from '@/components/ui/badge'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  read: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  replied: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

const statusIcons = {
  pending: Clock,
  read: Eye,
  replied: CheckCircle,
  archived: Archive,
}

export default function AdminContactsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [statusToUpdate, setStatusToUpdate] = useState<{ contact: Contact; newStatus: string } | null>(null)
  const [notes, setNotes] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<string | null>(null)

  const { data, isLoading } = useGetContactsQuery({
    page: 1,
    status: statusFilter === 'all' ? undefined : statusFilter as any,
    search: search || undefined,
  })
  const [updateStatus] = useUpdateContactStatusMutation()
  const [deleteContact] = useDeleteContactMutation()
  const { toast } = useToast()

  const handleViewDetails = (contact: Contact) => {
    setSelectedContact(contact)
    setNotes(contact.notes || '')
    setIsDetailDialogOpen(true)
  }

  const handleStatusChange = (contact: Contact, newStatus: string) => {
    setStatusToUpdate({ contact, newStatus })
    setNotes(contact.notes || '')
    setIsStatusDialogOpen(true)
  }

  const handleStatusUpdate = async () => {
    if (!statusToUpdate) return

    try {
      await updateStatus({
        id: statusToUpdate.contact.id,
        data: {
          status: statusToUpdate.newStatus as any,
          notes: notes.trim() || undefined,
        },
      }).unwrap()
      toast({
        title: 'Status updated',
        description: 'Contact status has been updated successfully.',
      })
      setIsStatusDialogOpen(false)
      setStatusToUpdate(null)
      setNotes('')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update status',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteClick = (id: string) => {
    setContactToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return

    try {
      await deleteContact(contactToDelete).unwrap()
      toast({
        title: 'Contact deleted',
        description: 'The contact has been deleted successfully.',
      })
      setContactToDelete(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete contact',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const StatusIcon = statusIcons[status as keyof typeof statusIcons] || Clock
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.pending}>
        <StatusIcon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Contact Queries</h1>
        <p className="mt-2 text-muted-foreground">Manage customer contact form submissions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <div className="space-y-4">
              {data.data.map((contact) => (
                <div
                  key={contact.id}
                  className="rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-lg">{contact.name}</h3>
                        {getStatusBadge(contact.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${contact.email}`} className="hover:text-foreground transition-colors">
                          {contact.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${contact.phone}`} className="hover:text-foreground transition-colors">
                          {contact.phone}
                        </a>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Subject: {contact.subject}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {contact.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Submitted: {formatDate(contact.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(contact)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Select
                        value={contact.status}
                        onValueChange={(value) => handleStatusChange(contact, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="read">Read</SelectItem>
                          <SelectItem value="replied">Replied</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(contact.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No contact queries found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
            <DialogDescription>
              View full details of the contact submission
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedContact.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">
                    <a href={`mailto:${selectedContact.email}`} className="hover:underline">
                      {selectedContact.email}
                    </a>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">
                    <a href={`tel:${selectedContact.phone}`} className="hover:underline">
                      {selectedContact.phone}
                    </a>
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="font-medium">{selectedContact.subject}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Message</Label>
                  <p className="font-medium whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted</Label>
                  <p className="font-medium">{formatDate(selectedContact.createdAt)}</p>
                </div>
                {selectedContact.updatedAt && (
                  <div>
                    <Label className="text-muted-foreground">Last Updated</Label>
                    <p className="font-medium">{formatDate(selectedContact.updatedAt)}</p>
                  </div>
                )}
                {selectedContact.repliedAt && (
                  <div>
                    <Label className="text-muted-foreground">Replied At</Label>
                    <p className="font-medium">{formatDate(selectedContact.repliedAt)}</p>
                  </div>
                )}
                {selectedContact.notes && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Admin Notes</Label>
                    <p className="font-medium whitespace-pre-wrap">{selectedContact.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Contact Status</DialogTitle>
            <DialogDescription>
              Update the status and add notes for this contact query
            </DialogDescription>
          </DialogHeader>
          {statusToUpdate && (
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={statusToUpdate.newStatus}
                  onValueChange={(value) => setStatusToUpdate({ ...statusToUpdate, newStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Admin Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this contact..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsStatusDialogOpen(false)
              setStatusToUpdate(null)
              setNotes('')
            }}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Contact"
        description="Are you sure you want to delete this contact query? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </div>
  )
}

