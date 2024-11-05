'use client'

import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { useUser } from '@/context/userContext'

interface LeaveApplicationData {
  employeeId: string
  leaveType: string
  startDate: string
  endDate: string
  reason: string
}

const leaveTypes = [
  'Annual Leave',
  'Sick Leave',
  'Personal Leave',
  'Maternity Leave',
  'Paternity Leave',
  'Bereavement Leave',
  'Unpaid Leave'
]

export default function LeaveApplication() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<LeaveApplicationData>({
    employeeId: user?.id || '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, leaveType: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return false
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast({
        title: 'Validation Error',
        description: 'End date must be after start date.',
        variant: 'destructive',
      })
      return false
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/employee/apply-leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json();
        toast({
          title: "Failed to apply a leave!",
          description: data.message,
          variant: "destructive"
        })
      }
      
      toast({
        title: 'Success',
        description: 'Leave application submitted successfully',
      })

      navigate('/all-leaves');
    } catch (error) {
      console.error('Error submitting leave application:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit leave application. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Leave Application</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="leaveType">Leave Type</Label>
              <Select onValueChange={handleSelectChange} value={formData.leaveType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Leave</Label>
              <Textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
                rows={4}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}