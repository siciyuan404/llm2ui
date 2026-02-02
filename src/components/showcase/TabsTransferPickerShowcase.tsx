/**
 * @file tabs-transfer-picker-showcase.tsx
 * @description Tabs Transfer Picker 在 Component Showcase 中的展示
 * @module components/showcase/tabs-transfer-picker-showcase
 */

import * as React from 'react';
import { TabsTransferPicker } from '@/components/ui/tabs-transfer-picker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Sparkles,
  Layout,
  Shield,
  BookOpen,
  Zap,
  Target,
  Lock,
  Globe,
  Code,
  CheckCircle2,
  ListChecks,
  TrendingUp,
  Filter,
  Hash,
} from 'lucide-react';
import type { DimensionData, SelectedElement, GenerationElement } from '@/components/ui/tabs-transfer-picker';

export const tabsTransferPickerShowcase = {
  id: 'tabs-transfer-picker',
  name: 'Tabs Transfer Picker',
  category: 'navigation' as const,
  description: '面向 LLM 的通用生成配置器 - 通过多维度标签页组合生成要素的三栏穿梭选择器',
  component: TabsTransferPickerShowcase,
};

function TabsTransferPickerShowcase() {
  const [selectedElements, setSelectedElements] = React.useState<SelectedElement[]>([]);
  const [showResult, setShowResult] = React.useState(false);

  const dimensions: DimensionData[] = [
    {
      dimension: {
        id: 'content-type',
        name: '内容类型',
        description: '选择生成内容的类型和形式',
      },
      elements: [
        {
          id: 'article',
          label: '技术文章',
          description: '深度技术分析和教程内容',
          dimensionId: 'content-type',
          icon: <FileText className="h-4 w-4 text-blue-500" />,
        },
        {
          id: 'tutorial',
          label: '教程指南',
          description: '步骤详细的操作指南',
          dimensionId: 'content-type',
          icon: <Sparkles className="h-4 w-4 text-purple-500" />,
        },
        {
          id: 'documentation',
          label: 'API 文档',
          description: '接口说明和调用示例',
          dimensionId: 'content-type',
          icon: <Layout className="h-4 w-4 text-green-500" />,
        },
        {
          id: 'code-review',
          label: '代码审查',
          description: '代码质量和改进建议',
          dimensionId: 'content-type',
          icon: <Shield className="h-4 w-4 text-orange-500" />,
        },
        {
          id: 'case-study',
          label: '案例分析',
          description: '实际场景的应用案例',
          dimensionId: 'content-type',
          icon: <BookOpen className="h-4 w-4 text-pink-500" />,
        },
      ],
    },
    {
      dimension: {
        id: 'style',
        name: '表达风格',
        description: '定义内容的表达方式',
      },
      elements: [
        {
          id: 'professional',
          label: '专业严谨',
          description: '使用正式的技术术语和规范表达',
          dimensionId: 'style',
          icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />,
        },
        {
          id: 'friendly',
          label: '亲切易懂',
          description: '使用口语化表达，便于理解',
          dimensionId: 'style',
          icon: <Sparkles className="h-4 w-4 text-green-500" />,
        },
        {
          id: 'concise',
          label: '简洁精炼',
          description: '用最少的信息表达核心内容',
          dimensionId: 'style',
          icon: <Zap className="h-4 w-4 text-yellow-500" />,
        },
        {
          id: 'detailed',
          label: '详细说明',
          description: '提供充分的背景和细节信息',
          dimensionId: 'style',
          icon: <ListChecks className="h-4 w-4 text-purple-500" />,
        },
      ],
    },
    {
      dimension: {
        id: 'structure',
        name: '输出结构',
        description: '定义内容的组织形式',
      },
      elements: [
        {
          id: 'markdown',
          label: 'Markdown',
          description: '标准的 Markdown 格式',
          dimensionId: 'structure',
          icon: <Code className="h-4 w-4 text-slate-500" />,
        },
        {
          id: 'list',
          label: '列表形式',
          description: '使用有序或无序列表',
          dimensionId: 'structure',
          icon: <ListChecks className="h-4 w-4 text-blue-500" />,
        },
        {
          id: 'table',
          label: '表格形式',
          description: '结构化表格展示',
          dimensionId: 'structure',
          icon: <Layout className="h-4 w-4 text-green-500" />,
        },
        {
          id: 'code-blocks',
          label: '代码块',
          description: '包含代码示例和说明',
          dimensionId: 'structure',
          icon: <Code className="h-4 w-4 text-purple-500" />,
        },
      ],
    },
    {
      dimension: {
        id: 'constraints',
        name: '约束规则',
        description: '设置生成内容的限制条件',
      },
      elements: [
        {
          id: 'max-length',
          label: '字数限制',
          description: '控制在 500 字以内',
          dimensionId: 'constraints',
          icon: <Filter className="h-4 w-4 text-orange-500" />,
        },
        {
          id: 'no-code',
          label: '无代码',
          description: '不包含任何代码示例',
          dimensionId: 'constraints',
          icon: <Lock className="h-4 w-4 text-red-500" />,
        },
        {
          id: 'english-only',
          label: '仅英文',
          description: '使用英文输出内容',
          dimensionId: 'constraints',
          icon: <Globe className="h-4 w-4 text-blue-500" />,
        },
        {
          id: 'highlight-points',
          label: '重点标注',
          description: '突出显示关键信息点',
          dimensionId: 'constraints',
          icon: <Target className="h-4 w-4 text-pink-500" />,
        },
      ],
    },
    {
      dimension: {
        id: 'context',
        name: '参考背景',
        description: '提供生成内容的上下文信息',
      },
      elements: [
        {
          id: 'beginner-friendly',
          label: '面向初学者',
          description: '适合新手理解和学习',
          dimensionId: 'context',
          icon: <Sparkles className="h-4 w-4 text-green-500" />,
        },
        {
          id: 'advanced',
          label: '面向专家',
          description: '适合有经验的开发者',
          dimensionId: 'context',
          icon: <TrendingUp className="h-4 w-4 text-blue-500" />,
        },
        {
          id: 'quick-reference',
          label: '快速参考',
          description: '便于快速查阅和检索',
          dimensionId: 'context',
          icon: <Zap className="h-4 w-4 text-yellow-500" />,
        },
        {
          id: 'best-practices',
          label: '最佳实践',
          description: '推荐的专业实践方法',
          dimensionId: 'context',
          icon: <CheckCircle2 className="h-4 w-4 text-purple-500" />,
        },
      ],
    },
  ];

  const handleAddElement = (element: GenerationElement) => {
    setSelectedElements(prev => [...prev, { ...element, order: prev.length }]);
  };

  const handleRemoveElement = (id: string) => {
    setSelectedElements(prev => prev.filter(item => item.id !== id));
  };

  const handleReorderElements = (elements: SelectedElement[]) => {
    setSelectedElements(elements);
  };

  const handleClearAll = () => {
    setSelectedElements([]);
    setShowResult(false);
  };

  const handleGenerate = () => {
    setShowResult(true);
  };

  const generatePrompt = () => {
    const dimensionGroups = selectedElements.reduce((acc, element) => {
      const dimension = dimensions.find(d => d.dimension.id === element.dimensionId);
      const dimensionName = dimension?.dimension.name || '其他';
      
      if (!acc[dimensionName]) acc[dimensionName] = [];
      acc[dimensionName].push(element.label);
      return acc;
    }, {} as Record<string, string[]>);
    
    let prompt = '生成配置：\n\n';
    Object.entries(dimensionGroups).forEach(([dimension, items]) => {
      prompt += `${dimension}：${items.join('、')}\n`;
    });
    
    prompt += `\n总计：${selectedElements.length} 个配置项`;

    return prompt;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tabs Transfer Picker 穿梭选择器</CardTitle>
          <CardDescription>
            面向 LLM 的通用生成配置器 - 通过多维度标签页组合生成要素
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <TabsTransferPicker
            dimensions={dimensions}
            selectedElements={selectedElements}
            onAddElement={handleAddElement}
            onRemoveElement={handleRemoveElement}
            onReorderElements={handleReorderElements}
          />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          onClick={handleGenerate}
          disabled={selectedElements.length === 0}
          size="lg"
          className="flex-1"
        >
          生成提示词
        </Button>
        <Button
          onClick={handleClearAll}
          disabled={selectedElements.length === 0}
          variant="outline"
          size="lg"
        >
          清空选择
        </Button>
      </div>

      {showResult && selectedElements.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">生成的提示词</h2>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="rounded-md bg-muted p-4">
            <pre className="whitespace-pre-wrap text-sm">
              {generatePrompt()}
            </pre>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">使用说明</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Hash className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <strong>左侧区域</strong>：切换不同的生成维度（如内容类型、表达风格等）
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Hash className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <strong>中间区域</strong>：浏览当前维度的可选要素，点击 + 号添加
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Hash className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <strong>右侧区域</strong>：查看已选要素，可拖拽调整顺序，点击 × 移除
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Hash className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <strong>优先级</strong>：已选要素的顺序会影响生成结果的权重
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
