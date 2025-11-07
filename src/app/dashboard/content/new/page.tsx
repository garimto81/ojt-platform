'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RichEditor } from '@/components/editor/rich-editor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Eye, FileText, Video, BookOpen, Trophy, ListTodo, FileQuestion } from 'lucide-react'

const contentTemplates = [
  {
    id: 'tournament-ops',
    name: 'Tournament Operations',
    icon: <Trophy className="h-8 w-8" />,
    description: 'Standard tournament setup and management guide',
    structure: {
      sections: [
        'Tournament Overview',
        'Setup Requirements',
        'Blind Structure',
        'Break Schedule',
        'Payout Structure',
        'Crisis Management',
        'Post-Tournament'
      ]
    }
  },
  {
    id: 'hand-analysis',
    name: 'Hand Analysis',
    icon: <FileText className="h-8 w-8" />,
    description: 'Detailed poker hand breakdown and strategy',
    structure: {
      sections: [
        'Hand Information',
        'Pre-flop Action',
        'Flop Analysis',
        'Turn Decision',
        'River Conclusion',
        'Key Takeaways'
      ]
    }
  },
  {
    id: 'broadcast-protocol',
    name: 'Broadcast Protocol',
    icon: <Video className="h-8 w-8" />,
    description: 'Live streaming setup and production guidelines',
    structure: {
      sections: [
        'Pre-Production Checklist',
        'Equipment Setup',
        'Camera Positions',
        'Graphics & Overlays',
        'Commentary Guidelines',
        'Troubleshooting'
      ]
    }
  },
  {
    id: 'crisis-response',
    name: 'Crisis Response',
    icon: <FileQuestion className="h-8 w-8" />,
    description: 'Emergency situation handling procedures',
    structure: {
      sections: [
        'Situation Assessment',
        'Immediate Actions',
        'Communication Protocol',
        'Resolution Steps',
        'Follow-up Actions',
        'Lessons Learned'
      ]
    }
  }
]

export default function NewContentPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    type: 'ARTICLE',
    category: '',
    tags: '',
    difficulty: 'BEGINNER',
    estimatedMinutes: 30,
  })
  const [saving, setSaving] = useState(false)

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = contentTemplates.find(t => t.id === templateId)
    if (template) {
      // Pre-fill content with template structure
      const sections = template.structure.sections
        .map(section => `## ${section}\n\n[Content here]\n`)
        .join('\n')

      setFormData({
        ...formData,
        content: `# ${template.name}\n\n${sections}`,
        category: template.name,
      })
    }
  }

  const handleSubmit = async (status: 'DRAFT' | 'IN_REVIEW') => {
    setSaving(true)

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status,
          templateId: selectedTemplate,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })

      if (response.ok) {
        router.push('/dashboard/content')
      }
    } catch (error) {
      console.error('Failed to save content:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="container py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/content">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Create New Content</h1>
                <p className="text-gray-600 dark:text-gray-400">Share your knowledge with the team</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSubmit('DRAFT')}
                disabled={saving || !formData.title || !formData.content}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                className="bg-ggp-primary hover:bg-orange-600"
                onClick={() => handleSubmit('IN_REVIEW')}
                disabled={saving || !formData.title || !formData.content}
              >
                <Eye className="h-4 w-4 mr-2" />
                Submit for Review
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Template Selection */}
        {!selectedTemplate && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Choose a Template (Optional)</CardTitle>
              <CardDescription>
                Start with a pre-defined structure or create custom content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {contentTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className="p-4 border rounded-lg hover:border-ggp-primary hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors text-left"
                  >
                    <div className="text-ggp-primary mb-2">{template.icon}</div>
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTemplate('custom')}
                >
                  Skip and Create Custom Content
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Form */}
        {selectedTemplate && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                      placeholder="Enter a descriptive title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                      rows={3}
                      placeholder="Brief description of the content"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Content *
                    </label>
                    <RichEditor
                      content={formData.content}
                      onChange={(content) => setFormData({ ...formData, content })}
                      placeholder="Start writing your content..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Content Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                    >
                      <option value="ARTICLE">Article</option>
                      <option value="VIDEO">Video</option>
                      <option value="GUIDE">Guide</option>
                      <option value="QUIZ">Quiz</option>
                      <option value="EXERCISE">Exercise</option>
                      <option value="TEMPLATE">Template</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                      placeholder="e.g., Tournament Operations"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Estimated Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedMinutes}
                      onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                      min="5"
                      max="240"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                      placeholder="poker, tournament, strategy"
                    />
                  </div>
                </CardContent>
              </Card>

              {selectedTemplate && selectedTemplate !== 'custom' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Template Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Using: <span className="font-semibold">
                        {contentTemplates.find(t => t.id === selectedTemplate)?.name}
                      </span>
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setSelectedTemplate(null)
                        setFormData({ ...formData, content: '' })
                      }}
                    >
                      Change Template
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}