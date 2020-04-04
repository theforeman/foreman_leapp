export const reportEntry = {
  hostname: 'leapp-20200407164551',
  severity: 'high',
  title: 'Difference in Python versions and support in RHEL 8',
  timeStamp: '2020-04-08T16:49:34.453295Z',
  tags: ['python'],
  summary: 'This checks difference in python versions',
  detail: {
    related_resources: [
      {
        scheme: 'package',
        title: 'python',
      },
      {
        scheme: 'package',
        title: 'python2',
      },
      {
        scheme: 'package',
        title: 'python3',
      },
    ],
    external: [
      {
        url:
          'https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html-single/configuring_basic_system_settings/#using-python3',
        title: 'Difference in Python versions and support in RHEL 8',
      },
    ],
    remediations: [
      {
        type: 'hint',
        context:
          'Please run "alternatives --set python /usr/bin/python3" after upgrade',
      },
    ],
  },
};
