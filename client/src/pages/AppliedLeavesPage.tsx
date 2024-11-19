import { useState, useEffect } from 'react'
import { useUser } from '@/context/userContext'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import Layout from '@/components/Layout'

interface LeaveApplication {
  _id: string
  employeeId: string
  leaveType: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  hrComments: string
  status: 'Pending' | 'Approved' | 'Rejected'
  submissionDate: string
}

export default function AppliedLeaves() {
  const { user } = useUser()
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLeaveApplications = async () => {
      if (!user?.id) return

      try {
        const response = await fetch(`/api/employee/all-leaves?employeeId=${user.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch leave applications')
        }
        const data = await response.json();
        setLeaveApplications(data.leaveApplications);
      } catch (error) {
        console.error('Error fetching leave applications:', error)
        toast({
          title: 'Error',
          description: 'Failed to load leave applications. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaveApplications()
  }, [user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: LeaveApplication['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-500'
      case 'Rejected':
        return 'bg-red-500'
      default:
        return 'bg-yellow-500'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>My Leave Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {leaveApplications.length === 0 ? (
            <p className="text-center text-muted-foreground">No leave applications found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Total Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>HR Comment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submission Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveApplications.map((application) => (
                  <TableRow key={application._id}>
                    <TableCell>{application.leaveType}</TableCell>
                    <TableCell>{formatDate(application.startDate)}</TableCell>
                    <TableCell>{formatDate(application.endDate)}</TableCell>
                    <TableCell>{application.totalDays}</TableCell>
                    <TableCell>{application.reason}</TableCell>
                    <TableCell>{application.hrComments || "No Comments from HR"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(application.submissionDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
    </Layout>
  )
}