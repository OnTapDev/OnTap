import { Clock, DollarSign, TrendingUp, FileCheck } from "lucide-react";
import { MiniLineChart } from "@/ui/components/MiniLineChart";
import { Card, CardContent } from "@/ui/primitives";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface ContractKPIsProps {
  kpis: {
    avgCycleTime: { value: number; change: string; chartData: number[] };
    avgAlcoholCogs: { value: number; change: string; chartData: number[] };
    avgRevenuePerHour: { value: number; change: string; chartData: number[] };
    totalSigned: { value: number; change: string; chartData: number[] };
  };
}

export function ContractKPIs({ kpis }: ContractKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <Link href="/contracts/kpi/avg-cycle-time">
        <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] hover:shadow-lg hover:shadow-olive-gold/10 transition-all duration-200 cursor-pointer h-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-lg bg-olive-gold/20 p-3">
                <Clock className="h-6 w-6 text-olive-gold" />
              </div>
              <MiniLineChart data={kpis.avgCycleTime.chartData.length > 0 ? kpis.avgCycleTime.chartData : [10, 8, 12, 7, 6, 9, 5, 7, 6, 8, 5, 4]} color="#7D7254" />
            </div>
            <p className="text-meta text-warm-sand">Avg Cycle Time</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-2xl font-bold text-warm-white">
                {kpis.avgCycleTime.value > 0 ? `${kpis.avgCycleTime.value} days` : "0 days"}
              </p>
              {kpis.avgCycleTime.change && kpis.avgCycleTime.value > 0 && (
                <div className="flex items-center gap-1 text-sm text-olive-gold">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{kpis.avgCycleTime.change}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link href="/contracts/kpi/alcohol-cogs">
        <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] hover:shadow-lg hover:shadow-olive-gold/10 transition-all duration-200 cursor-pointer h-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-lg bg-olive-gold/20 p-3">
                <DollarSign className="h-6 w-6 text-olive-gold" />
              </div>
              <MiniLineChart data={kpis.avgAlcoholCogs.chartData.length > 0 ? kpis.avgAlcoholCogs.chartData : [25, 22, 20, 18, 19, 17, 16, 15, 14, 16, 15, 14]} color="#7D7254" />
            </div>
            <p className="text-meta text-warm-sand">Alcohol COGS</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-2xl font-bold text-warm-white">
                {kpis.avgAlcoholCogs.value > 0 ? `${kpis.avgAlcoholCogs.value}%` : "0%"}
              </p>
              {kpis.avgAlcoholCogs.change && kpis.avgAlcoholCogs.value > 0 && (
                <div className="flex items-center gap-1 text-sm text-olive-gold">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{kpis.avgAlcoholCogs.change}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link href="/contracts/kpi/revenue-per-hour">
        <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] hover:shadow-lg hover:shadow-olive-gold/10 transition-all duration-200 cursor-pointer h-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-lg bg-olive-gold/20 p-3">
                <TrendingUp className="h-6 w-6 text-olive-gold" />
              </div>
              <MiniLineChart data={kpis.avgRevenuePerHour.chartData.length > 0 ? kpis.avgRevenuePerHour.chartData : [150, 165, 180, 175, 190, 200, 195, 210, 205, 220, 215, 230]} color="#7D7254" />
            </div>
            <p className="text-meta text-warm-sand">Revenue/Hour</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-2xl font-bold text-warm-white">
                {kpis.avgRevenuePerHour.value > 0 ? `$${kpis.avgRevenuePerHour.value}` : "$0"}
              </p>
              {kpis.avgRevenuePerHour.change && kpis.avgRevenuePerHour.value > 0 && (
                <div className="flex items-center gap-1 text-sm text-olive-gold">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{kpis.avgRevenuePerHour.change}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link href="/contracts/kpi/signed-contracts">
        <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] hover:shadow-lg hover:shadow-olive-gold/10 transition-all duration-200 cursor-pointer h-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-lg bg-olive-gold/20 p-3">
                <FileCheck className="h-6 w-6 text-olive-gold" />
              </div>
              <MiniLineChart data={kpis.totalSigned.chartData.length > 0 ? kpis.totalSigned.chartData : [5, 8, 12, 10, 15, 18, 20, 22, 25, 28, 30, 32]} color="#7D7254" />
            </div>
            <p className="text-meta text-warm-sand">Signed Contracts</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-2xl font-bold text-warm-white">{kpis.totalSigned.value} contracts</p>
              {kpis.totalSigned.change && kpis.totalSigned.value > 0 && (
                <div className="flex items-center gap-1 text-sm text-olive-gold">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{kpis.totalSigned.change}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}