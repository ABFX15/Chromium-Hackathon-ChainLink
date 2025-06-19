import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface ActivityItem {
  type: "loan" | "risk" | "value" | "yield";
  message: string;
  timestamp: string;
}

const getActivityColor = (type: ActivityItem["type"]) => {
  switch (type) {
    case "loan":
      return "bg-green-400";
    case "risk":
      return "bg-purple-400";
    case "value":
      return "bg-cyan-400";
    case "yield":
      return "bg-amber-400";
    default:
      return "bg-gray-400";
  }
};

export function ActivityFeed() {
  const recentActivities: ActivityItem[] = [
    {
      type: "loan",
      message: "Loan #123 funded",
      timestamp: "2m ago",
    },
    {
      type: "risk",
      message: "Risk score updated",
      timestamp: "1h ago",
    },
    {
      type: "value",
      message: "Property value updated",
      timestamp: "3h ago",
    },
    {
      type: "yield",
      message: "Yield harvested",
      timestamp: "5h ago",
    },
  ];

  return (
    <Card className="bg-gray-800/50 border-amber-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-amber-400 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div
                className={`w-2 h-2 rounded-full ${getActivityColor(
                  activity.type
                )}`}
              />
              <div className="flex-1">{activity.message}</div>
              <div className="text-gray-400">{activity.timestamp}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
