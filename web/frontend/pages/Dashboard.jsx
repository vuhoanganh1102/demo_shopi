import { Card, Page, Layout, TextContainer, Text } from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  return (
    <Page>
      <TitleBar title={t('Dashboard.title')}>
        <button variant="primary" onClick={() => console.log('Primary action')}>
          {t('Dashboard.primaryAction')}
        </button>
        <button onClick={() => console.log('Secondary action')}>
          {t('Dashboard.secondaryAction')}
        </button>
      </TitleBar>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingMd" as="h2">
              {t('Dashboard.heading')}
            </Text>
            <TextContainer>
              <p>{t('Dashboard.body')}</p>
            </TextContainer>
          </Card>
          <Card sectioned>
            <Text variant="headingMd" as="h2">
              {t('Dashboard.heading')}
            </Text>
            <TextContainer>
              <p>{t('Dashboard.body')}</p>
            </TextContainer>
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <Card sectioned>
            <Text variant="headingMd" as="h2">
              {t('Dashboard.heading')}
            </Text>
            <TextContainer>
              <p>{t('Dashboard.body')}</p>
            </TextContainer>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
