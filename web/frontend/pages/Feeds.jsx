import { Card, Page, Layout, TextContainer, Text } from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';

export default function Feeds() {
  const { t } = useTranslation();
  return (
    <Page>
      <TitleBar title={t('Feeds.title')}>
        <button variant="primary" onClick={() => console.log('Primary action')}>
          {t('Feeds.primaryAction')}
        </button>
        <button onClick={() => console.log('Secondary action')}>
          {t('Feeds.secondaryAction')}
        </button>
      </TitleBar>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingMd" as="h2">
              {t('Feeds.heading')}
            </Text>
            <TextContainer>
              <p>{t('Feeds.body')}</p>
            </TextContainer>
          </Card>
          <Card sectioned>
            <Text variant="headingMd" as="h2">
              {t('Feeds.heading')}
            </Text>
            <TextContainer>
              <p>{t('Feeds.body')}</p>
            </TextContainer>
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <Card sectioned>
            <Text variant="headingMd" as="h2">
              {t('Feeds.heading')}
            </Text>
            <TextContainer>
              <p>{t('Feeds.body')}</p>
            </TextContainer>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
