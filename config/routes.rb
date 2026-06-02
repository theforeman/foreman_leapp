# frozen_string_literal: true

Rails.application.routes.draw do
  resources :preupgrade_reports, only: %i[index]

  namespace :api, defaults: { format: 'json' } do
    scope '(:apiv)', module: :v2, defaults: { apiv: 'v2' }, apiv: /v2/,
      constraints: ApiConstraints.new(version: 2, default: true) do
      resources :preupgrade_report_entries, only: %i[index] do
        collection do
          get :auto_complete_search
        end
      end

      resources :preupgrade_reports, only: %i[index show] do
        resources :preupgrade_report_entries, only: %i[index] do
          collection do
            get :auto_complete_search
            post :bulk_remediate
          end
        end
      end

      get 'job_invocations/:id/preupgrade_reports', to: 'preupgrade_reports#job_invocation'
    end
  end
end
