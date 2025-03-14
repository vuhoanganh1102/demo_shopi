import { Card, Page, Layout, TextContainer, Text } from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';

export default function GeneralSettings() {
  const { t } = useTranslation();
  return (
    <Page>
      <TitleBar title={t('GeneralSettings.title')}>
        <button variant="primary" onClick={() => console.log('Primary action')}>
          {t('GeneralSettings.primaryAction')}
        </button>
        <button onClick={() => console.log('Secondary action')}>
          {t('GeneralSettings.secondaryAction')}
        </button>
      </TitleBar>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingMd" as="h2">
              {t('GeneralSettings.heading')}
            </Text>
            <TextContainer>
              <p>{t('GeneralSettings.body')}</p>
            </TextContainer>
          </Card>
          <Card sectioned>
            <Text variant="headingMd" as="h2">
              {t('GeneralSettings.heading')}
            </Text>
            <TextContainer>
              <p>{t('GeneralSettings.body')}</p>
            </TextContainer>
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <Card sectioned>
            <Text variant="headingMd" as="h2">
              {t('GeneralSettings.heading')}
            </Text>
            <TextContainer>
              <p>{t('GeneralSettings.body')}</p>
            </TextContainer>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
