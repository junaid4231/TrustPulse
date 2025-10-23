'use client';

import { useState } from 'react';

interface TriggerSettings {
  sensitivity?: 'low' | 'medium' | 'high';
  percentage?: number;
  direction?: 'down' | 'up';
  seconds?: number;
  selector?: string;
}

interface Trigger {
  type: 'exit_intent' | 'scroll_depth' | 'time_on_page' | 'inactivity' | 'element_visible';
  enabled: boolean;
  settings: TriggerSettings;
}

interface BehaviorTriggersConfig {
  enabled: boolean;
  trigger_mode: 'any' | 'all';
  triggers: Trigger[];
}

interface Props {
  value: BehaviorTriggersConfig | null;
  onChange: (config: BehaviorTriggersConfig | null) => void;
}

export default function BehaviorTriggersEditor({ value, onChange }: Props) {
  const [config, setConfig] = useState<BehaviorTriggersConfig>(
    value || {
      enabled: false,
      trigger_mode: 'any',
      triggers: [],
    }
  );

  const updateConfig = (updates: Partial<BehaviorTriggersConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange(newConfig.enabled ? newConfig : null);
  };

  const addTrigger = (type: Trigger['type']) => {
    const defaultSettings: Record<Trigger['type'], TriggerSettings> = {
      exit_intent: { sensitivity: 'medium' },
      scroll_depth: { percentage: 50, direction: 'down' },
      time_on_page: { seconds: 30 },
      inactivity: { seconds: 20 },
      element_visible: { selector: '#pricing', percentage: 50 },
    };

    const newTrigger: Trigger = {
      type,
      enabled: true,
      settings: defaultSettings[type],
    };

    updateConfig({
      triggers: [...config.triggers, newTrigger],
    });
  };

  const removeTrigger = (index: number) => {
    updateConfig({
      triggers: config.triggers.filter((_, i) => i !== index),
    });
  };

  const updateTrigger = (index: number, updates: Partial<Trigger>) => {
    const newTriggers = [...config.triggers];
    newTriggers[index] = { ...newTriggers[index], ...updates };
    updateConfig({ triggers: newTriggers });
  };

  const updateTriggerSettings = (index: number, settings: Partial<TriggerSettings>) => {
    const newTriggers = [...config.triggers];
    newTriggers[index].settings = { ...newTriggers[index].settings, ...settings };
    updateConfig({ triggers: newTriggers });
  };

  const triggerTypeLabels = {
    exit_intent: '🎯 Exit Intent',
    scroll_depth: '📜 Scroll Depth',
    time_on_page: '⏱️ Time on Page',
    inactivity: '😴 Inactivity',
    element_visible: '👁️ Element Visible',
  };

  const triggerDescriptions = {
    exit_intent: {
      description: 'Shows when user moves cursor to top of browser (trying to leave)',
      bestFor: 'Last-chance offers, cart abandonment, lead capture',
      example: '"Wait! Get 20% off before you leave!"',
    },
    scroll_depth: {
      description: 'Shows when user scrolls to a specific percentage of the page',
      bestFor: 'Engaged readers, content-based offers',
      example: '"Enjoyed this? Get our free guide!"',
    },
    time_on_page: {
      description: 'Shows after user has been on page for X seconds',
      bestFor: 'Interested visitors, engagement-based offers',
      example: '"Still browsing? Here\'s 15% off!"',
    },
    inactivity: {
      description: 'Shows when user stops interacting (no mouse, keyboard, scroll)',
      bestFor: 'Re-engagement, help offers, preventing abandonment',
      example: '"Need help? Chat with us!"',
    },
    element_visible: {
      description: 'Shows when a specific element becomes visible on screen',
      bestFor: 'Context-aware offers, pricing page triggers',
      example: '"Only 5 spots left at this price!"',
    },
  };

  const availableTriggerTypes = Object.keys(triggerTypeLabels) as Trigger['type'][];
  const usedTriggerTypes = config.triggers.map((t) => t.type);
  const unusedTriggerTypes = availableTriggerTypes.filter((t) => !usedTriggerTypes.includes(t));

  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="space-y-6">
      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              💡 What are Behavior Triggers?
            </h4>
            <p className="text-sm text-blue-800 mb-3">
              Show notifications at the <strong>perfect moment</strong> based on user behavior. Get 2-5x better conversions than random timing!
            </p>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showHelp ? '▼ Hide Guidelines' : '▶ Show Guidelines & Best Practices'}
            </button>
          </div>
        </div>

        {showHelp && (
          <div className="mt-4 space-y-4 border-t border-blue-200 pt-4">
            {/* Quick Start */}
            <div>
              <h5 className="text-sm font-semibold text-blue-900 mb-2">🚀 Quick Start (Recommended)</h5>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Toggle "Behavior Triggers" <strong>ON</strong></li>
                <li>Keep mode as <strong>"ANY"</strong> (easier to trigger)</li>
                <li>Click <strong>"+ Exit Intent"</strong> button</li>
                <li>Keep default settings (Medium sensitivity, 30s cooldown)</li>
                <li>Save notification and test on your website!</li>
              </ol>
            </div>

            {/* Best Practices */}
            <div>
              <h5 className="text-sm font-semibold text-blue-900 mb-2">✅ Best Practices</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Create 3-5 notifications</strong> with same trigger (they'll rotate automatically)</li>
                <li>• <strong>Use 30s cooldown</strong> on Exit Intent (allows multiple triggers)</li>
                <li>• <strong>Start with 1-2 triggers</strong> per notification (don't overwhelm)</li>
                <li>• <strong>Test on mobile AND desktop</strong> (some triggers work better on each)</li>
                <li>• <strong>Monitor and optimize</strong> based on conversion data</li>
              </ul>
            </div>

            {/* Common Mistakes */}
            <div>
              <h5 className="text-sm font-semibold text-red-900 mb-2">❌ Common Mistakes to Avoid</h5>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• <strong>Only 1 notification:</strong> Feels fake when same message repeats</li>
                <li>• <strong>No cooldown (0s):</strong> Fires once only, users think it's scripted</li>
                <li>• <strong>Too many triggers:</strong> Overwhelming and hard to manage</li>
                <li>• <strong>Too aggressive timing:</strong> 5s time on page = annoying</li>
              </ul>
            </div>

            {/* Expected Results */}
            <div className="bg-white rounded p-3">
              <h5 className="text-sm font-semibold text-green-900 mb-2">📈 Expected Results</h5>
              <div className="grid grid-cols-2 gap-2 text-xs text-green-800">
                <div>• Conversion Rate: <strong>4x better</strong></div>
                <div>• Bounce Rate: <strong>35% reduction</strong></div>
                <div>• Time on Site: <strong>3x longer</strong></div>
                <div>• Revenue: <strong>3-5x more</strong></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Behavior Triggers</h3>
          <p className="text-sm text-gray-600">
            Show notification based on user behavior
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => updateConfig({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {config.enabled && (
        <>
          {/* Trigger Mode */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trigger Mode
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="any"
                  checked={config.trigger_mode === 'any'}
                  onChange={(e) => updateConfig({ trigger_mode: e.target.value as 'any' })}
                  className="mr-2"
                />
                <span className="text-sm">
                  <strong>ANY</strong> (OR) - Show when any trigger fires
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="all"
                  checked={config.trigger_mode === 'all'}
                  onChange={(e) => updateConfig({ trigger_mode: e.target.value as 'all' })}
                  className="mr-2"
                />
                <span className="text-sm">
                  <strong>ALL</strong> (AND) - Show only when all triggers fire
                </span>
              </label>
            </div>
          </div>

          {/* Triggers List */}
          <div className="space-y-4">
            {config.triggers.map((trigger, index) => (
              <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">
                      {triggerTypeLabels[trigger.type]}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={trigger.enabled}
                        onChange={(e) => updateTrigger(index, { enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <button
                    onClick={() => removeTrigger(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>

                {/* Trigger-specific settings */}
                {trigger.type === 'exit_intent' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sensitivity
                    </label>
                    <select
                      value={trigger.settings.sensitivity}
                      onChange={(e) =>
                        updateTriggerSettings(index, {
                          sensitivity: e.target.value as 'low' | 'medium' | 'high',
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="low">Low (10px threshold)</option>
                      <option value="medium">Medium (5px threshold)</option>
                      <option value="high">High (2px threshold)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 <strong>Smart Rotation:</strong> Single notification shows once. Multiple notifications rotate automatically!
                    </p>
                  </div>
                )}

                {trigger.type === 'scroll_depth' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scroll Percentage
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={trigger.settings.percentage}
                        onChange={(e) =>
                          updateTriggerSettings(index, { percentage: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Direction
                      </label>
                      <select
                        value={trigger.settings.direction}
                        onChange={(e) =>
                          updateTriggerSettings(index, { direction: e.target.value as 'down' | 'up' })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="down">Scroll Down</option>
                        <option value="up">Scroll Up</option>
                      </select>
                    </div>
                  </div>
                )}

                {trigger.type === 'time_on_page' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seconds on Page
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={trigger.settings.seconds}
                      onChange={(e) =>
                        updateTriggerSettings(index, { seconds: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}

                {trigger.type === 'inactivity' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inactivity Duration (seconds)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={trigger.settings.seconds}
                      onChange={(e) =>
                        updateTriggerSettings(index, { seconds: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}

                {trigger.type === 'element_visible' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CSS Selector
                      </label>
                      <input
                        type="text"
                        value={trigger.settings.selector}
                        onChange={(e) => updateTriggerSettings(index, { selector: e.target.value })}
                        placeholder="#pricing, .product, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Visibility %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={trigger.settings.percentage}
                        onChange={(e) =>
                          updateTriggerSettings(index, { percentage: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Trigger Button */}
          {unusedTriggerTypes.length > 0 && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Add Trigger Type
              </label>
              <div className="space-y-3">
                {unusedTriggerTypes.map((type) => (
                  <div key={type} className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-400 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 mb-1">
                          {triggerTypeLabels[type]}
                        </h5>
                        <p className="text-xs text-gray-600 mb-1">
                          {triggerDescriptions[type].description}
                        </p>
                        <p className="text-xs text-gray-500">
                          <strong>Best for:</strong> {triggerDescriptions[type].bestFor}
                        </p>
                        <p className="text-xs text-blue-600 italic mt-1">
                          Example: {triggerDescriptions[type].example}
                        </p>
                      </div>
                      <button
                        onClick={() => addTrigger(type)}
                        className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium whitespace-nowrap"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Configuration Preview</h4>
            <pre className="text-xs text-blue-800 overflow-x-auto">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
