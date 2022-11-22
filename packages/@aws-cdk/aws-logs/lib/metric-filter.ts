import { Metric, MetricOptions } from '@aws-cdk/aws-cloudwatch';
import { Resource } from '@aws-cdk/core';
import { Construct } from 'constructs';
import { ILogGroup, MetricFilterOptions } from './log-group';
import { CfnMetricFilter } from './logs.generated';

/**
 * Properties for a MetricFilter
 */
export interface MetricFilterProps extends MetricFilterOptions {
  /**
   * The log group to create the filter on.
   */
  readonly logGroup: ILogGroup;
}

/**
 * Properties for a MetricFilter
 */
export enum MetricFilterUnits {
  "Bits" = "Bits",
  "Bits/Second" = "Bits/Second",
  "Bytes" = "Bytes",
  "Bytes/Second" = "Bytes/Second",
  "Count" = "Count",
  "Count/Second" = "Count/Second",
  "Gigabits" = "Gigabits",
  "Gigabits/Second" = "Gigabits/Second",
  "Gigabytes" = "Gigabytes",
  "Gigabytes/Second" = "Gigabytes/Second",
  "Kilobits" = "Kilobits",
  "Kilobits/Second" = "Kilobits/Second",
  "Kilobytes" = "Kilobytes",
  "Kilobytes/Second" = "Kilobytes/Second",
  "Megabits" = "Megabits",
  "Megabits/Second" = "Megabits/Second",
  "Megabytes" = "Megabytes",
  "Megabytes/Second" = "Megabytes/Second",
  "Microseconds" = "Microseconds",
  "Milliseconds" = "Milliseconds",
  "None" = "None",
  "Percent" = "Percent",
  "Seconds" = "Seconds",
  "Terabits" = "Terabits",
  "Terabits/Second" = "Terabits/Second",
  "Terabytes" = "Terabytes",
  "Terabytes/Second"
}

/**
 * A filter that extracts information from CloudWatch Logs and emits to CloudWatch Metrics
 */
export class MetricFilter extends Resource {

  private readonly metricName: string;
  private readonly metricNamespace: string;

  constructor(scope: Construct, id: string, props: MetricFilterProps) {
    super(scope, id);

    this.metricName = props.metricName;
    this.metricNamespace = props.metricNamespace;

    if (Object.keys(props.dimensions ?? {}).length > 3) {
      throw new Error('MetricFilter only supports a maximum of 3 Dimensions');
    }

    // It looks odd to map this object to a singleton list, but that's how
    // we're supposed to do it according to the docs.
    //
    // > Currently, you can specify only one metric transformation for
    // > each metric filter. If you want to specify multiple metric
    // > transformations, you must specify multiple metric filters.
    //
    // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-logs-metricfilter.html
    new CfnMetricFilter(this, 'Resource', {
      logGroupName: props.logGroup.logGroupName,
      filterPattern: props.filterPattern.logPatternString,
      metricTransformations: [{
        metricNamespace: props.metricNamespace,
        metricName: props.metricName,
        metricValue: props.metricValue ?? '1',
        defaultValue: props.defaultValue,
        unit : props.unit ?? MetricFilterUnits.None,
        dimensions: props.dimensions ? Object.entries(props.dimensions).map(([key, value]) => ({ key, value })) : undefined,
      }],
    });
  }

  /**
   * Return the given named metric for this Metric Filter
   *
   * @default avg over 5 minutes
   */
  public metric(props?: MetricOptions): Metric {
    return new Metric({
      metricName: this.metricName,
      namespace: this.metricNamespace,
      statistic: 'avg',
      ...props,
    }).attachTo(this);
  }
}
