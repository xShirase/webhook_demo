## Audit trails ([Cloudwatch Insights](https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:logs-insights$3FqueryDetail$3D$257E$2528end$257E$25272020-09-15T22*3a59*3a59.000Z$257Estart$257E$25272020-09-14T23*3a00*3a00.000Z$257EtimeType$257E$2527ABSOLUTE$257Etz$257E$2527Local$257EeditorString$257E$2527fields*20*40timestamp*2c*20*40message*0a*7c*20sort*20*40timestamp*20asc*0a*7c*20filter*20*40message*20like*20*2f.*2acdb2a97a-e56b-8320-cb5e-f6ce73c7823c.*2a*2f$257EisLiveTail$257Efalse$257EqueryId$257E$25279ed584de-2c2e-4823-b143-8f902310a006$257Esource$257E$2528$257E$2527*2faws*2fevents*2fdemo_audit$2529$2529))

### Retry Parameters

```
backoffRate: 1.5
backoffIntervalSeconds: 10
backoffMaxRetries: 10
```

### Retry 404 : 37c2369b-1c72-35f9-1ae4-471e4a2b70d7

**CloudWatch Logs Insights**  
region: us-east-1  
log-group-names: /aws/events/demo_audit  
start-time: 2020-09-14T23:00:00.000Z  
end-time: 2020-09-15T22:59:59.000Z  
query-string:
```
fields @timestamp, @message
| sort @timestamp asc
| filter @message like /.*37c2369b-1c72-35f9-1ae4-471e4a2b70d7.*/
```

The timestamps confirm the backoff and MaxRetries are working as expected.


### Success First go : ce303596-cf28-74d4-8b50-c56fe6bb18f2

**CloudWatch Logs Insights**  
region: us-east-1  
log-group-names: /aws/events/demo_audit  
start-time: 2020-09-14T23:00:00.000Z  
end-time: 2020-09-15T22:59:59.000Z  
query-string:
```
fields @timestamp, @message
| sort @timestamp asc
| filter @message like /.*ce303596-cf28-74d4-8b50-c56fe6bb18f2.*/
```



### Success but not at first
cdb2a97a-e56b-8320-cb5e-f6ce73c7823c

https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Flambda$252Fwebhookdemo-dev-onCollectionRequested/log-events/2020$252F09$252F15$252F$255B$2524LATEST$255D4d3809bff8754103b0a37d43a8725c21

